const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/todo-list-app', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

// MongoDB Task Model
const Task = mongoose.model('Task', {
    text: String,
    reminder: Date,
});

// Schedule reminders using node-schedule (every day at 12:00 AM)
schedule.scheduleJob('0 0 * * *', async () => {
    try {
        const currentDate = new Date();
        const tasksWithReminders = await Task.find({ reminder: { $lt: currentDate } });
        // Implement your reminder logic here
        console.log('Sending reminders for tasks:', tasksWithReminders);
    } catch (error) {
        console.error('Error sending reminders:', error);
    }
});

// Routes for handling tasks (GET, POST, DELETE)
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const { text, reminder } = req.body;
        console.log(req.body);
        const task = new Task({ text, reminder });
        const savedTask = await task.save();
        res.json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        const deletedTask = await Task.findByIdAndRemove(taskId);
        res.json(deletedTask);
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text, reminder } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(id, { text, reminder }, { new: true });
        console.log(updatedTask);
        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
