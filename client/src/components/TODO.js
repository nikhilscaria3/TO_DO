import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/baseapi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import '../styles/TODO.css';
import notificationSound from "../music/123.mp3";
import { Button } from 'react-bootstrap';
import Modal from 'react-modal';



function TODO() {

    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [reminderDate, setReminderDate] = useState(null);
    const [notificationShown, setNotificationShown] = useState(false);
    const [updateTask, setUpdateTask] = useState(null);
    const [message, setmessage] = useState("")
    const [editTaskText, setEditTaskText] = useState('');
    const [editTaskReminder, setEditTaskReminder] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    const openAddModal = () => {
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const openEditModal = (task) => {
        setIsEditModalOpen(true);
        setEditTaskText(task.text);
        setEditTaskReminder(task.reminder ? new Date(task.reminder) : null);
        setUpdateTask(task);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };


    const showNotification = useCallback((taskText) => {
        if ('Notification' in window && Notification.permission === 'granted' && !notificationShown) {
            new Notification(`Todo List Reminder`, {
                body: taskText,
                icon: '../images/bell.png'
            });
            setNotificationShown(true);
        } else if ('Notification' in window && Notification.permission !== 'denied' && !notificationShown) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(`Todo List Reminder`, {
                        body: taskText,
                        icon: '../images/bell.png'
                    });
                    setNotificationShown(true);
                }
            });
        }
    }, [notificationShown]);

    const playNotificationSound = () => {
        const audio = new Audio(notificationSound);
        audio.play().catch(error => {
            console.error("Failed to play audio:", error);
        });
    };


    useEffect(() => {
        // Function to fetch tasks and check for reminders
        const fetchTasksAndReminders = async () => {
            try {
                const response = await axios.get('/tasks');
                const tasks = response.data;
                setTasks(response.data)
                // Check for tasks with reminders matching the current time and show notifications
                const now = moment().format();
                tasks.forEach(task => {
                    const taskReminder = moment(task.reminder).format(); // Ensure task.reminder is in the correct format
                    if (task.reminder && moment(taskReminder).isSame(now, 'minute')) {
                        showNotification(task.text);
                        playNotificationSound();
                    }
                });

                // Call the function recursively after a specific interval (e.g., 1 minute)
                setTimeout(fetchTasksAndReminders, 60000); // Check every minute (adjust as needed)
            } catch (error) {
                console.error(error);
            }
        };

        // Start the process initially
        fetchTasksAndReminders();
    }, [showNotification]); // Dependency array includes showNotification

    const addTask = () => {
        axios.post('/tasks', { text: newTask, reminder: reminderDate })
            .then(response => {
                setTasks([...tasks, response.data]);
                setNewTask('');
                setReminderDate(null);
                closeAddModal()

                setmessage("Added Successfully")
                // Trigger notification when a new task is added
                showNotification('New Task Added');

            })
            .catch(error => {
                console.error(error);
            });
    };


    useEffect(() => {
        if (message) {
            // Only set a timeout if the message is not empty
            const timer = setTimeout(() => {
                setmessage('');
            }, 5000);

            // Cleanup function to clear the timeout if the component unmounts or the message changes before 5 seconds
            return () => clearTimeout(timer);
        }
    }, [message]);


    const deleteTask = (taskId) => {
        // Send a DELETE request to remove a task from the backend
        axios.delete(`/tasks/${taskId}`)
            .then(() => {
                setTasks(tasks.filter(task => task._id !== taskId));
            })
            .catch(error => {
                console.error(error);
            });
    };


    const handleUpdateTask = async () => {
        try {
            // Make an API call to update the task on the server using axios
            const response = await axios.put(`/tasks/${updateTask._id}`, {
                text: editTaskText,
                reminder: editTaskReminder
            });

            // Check if the update was successful based on the response status
            if (response) {
                // Update the tasks state with the updated task
                setTasks(tasks.map(task => (task._id === updateTask._id ? response.data : task)));
                closeAddModal()
                setmessage("Updated Successfully");

                // Close the modal after successful update

            } else {
                setmessage("Update Error");
                // Handle unsuccessful update (e.g., display an error message)
                console.error("Update failed");
            }
        } catch (error) {
            console.error(error);
        }
    };


    return (

        <div className='HeadContainer' style={{ backgroundcolor: "hsl(218, 41%, 15%)" }}>
            <div className='MainContainer' style={{ backgroundcolor: "hsl(218, 41%, 15%)" }}>
                <nav className="navbar navbar-expand-lg navbar-light ">
                    <div className="container-fluid">
                        <a className="navbar-brand" href="/">
                            <h1 className='navbrand'>Todo List</h1>
                        </a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item me-auto mb-2 ml-3">
                                    <button type="button" id="button" className="navbutton btn btn-outline-dark me-2" onClick={openAddModal}>
                                        To Add
                                    </button>
                                    <Modal
                                        isOpen={isAddModalOpen}
                                        onRequestClose={closeAddModal}
                                        contentLabel="Add Task Modal"
                                    >
                                        <div className="mb-3">
                                            <textarea
                                                className="form-control"
                                                placeholder="New Task"
                                                value={newTask}
                                                onChange={(e) => setNewTask(e.target.value)}
                                                rows={5}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <DatePicker
                                                selected={reminderDate}
                                                onChange={(date) => setReminderDate(date)}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={5}
                                                timeCaption="Time"
                                                dateFormat="MMMM d, yyyy h:mm aa"
                                                className="form-control"
                                                placeholderText="Select Reminder Date & Time"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <Button variant="primary" onClick={addTask}>
                                                Add Task
                                            </Button>
                                        </div>
                                    </Modal>

                                </li>

                            </ul>
                        </div>
                    </div>
                    {/* ... Navigation bar content ... */}
                </nav>


                <div className='messagecontainer'>
                    <p className='message'>{message}</p>
                </div>


                <div className="container todo-container mt-5">
                    <div className="col-md-12">
                        <div className="card-deck">
                            {tasks.slice().reverse().map(task => {
                                const isTaskExpired = moment(task.reminder).isBefore(moment());
                                return (
                                    <div key={task._id} className={`card mb-4 ${isTaskExpired ? 'expired' : ''}`}>
                                        <div className="card-body">
                                            <h5 className="card-title">{task.text}</h5>
                                            {isTaskExpired ? (
                                                <p className="card-text expired-info">Expired: {moment(task.reminder).format('MMMM D, YYYY h:mm A')}</p>
                                            ) : (
                                                <p className="card-text date-info">{moment(task.reminder).format('MMMM D, YYYY h:mm A')}</p>
                                            )}
                                            <div className="button-group d-flex justify-content-start gap-3 mt-3">
                                                <button className="btn btn-danger" onClick={() => deleteTask(task._id)}>
                                                    Delete
                                                </button>
                                                <button className="btn btn-primary" onClick={() => openEditModal(task)}>
                                                    Edit
                                                </button>
                                                <Modal
                                                    isOpen={isEditModalOpen}
                                                    onRequestClose={closeEditModal}
                                                    contentLabel="Edit Task Modal"
                                                >
                                                    <div className="mb-3">
                                                        <textarea
                                                            className="form-control"
                                                            placeholder="Edit Task"
                                                            value={editTaskText}
                                                            onChange={(e) => setEditTaskText(e.target.value)}
                                                            rows={5}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <DatePicker
                                                            selected={editTaskReminder}
                                                            onChange={(date) => setEditTaskReminder(date)}
                                                            showTimeSelect
                                                            timeFormat="HH:mm"
                                                            timeIntervals={5}
                                                            timeCaption="Time"
                                                            dateFormat="MMMM d, yyyy h:mm aa"
                                                            className="form-control"
                                                            placeholderText="Select Reminder Date & Time"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <Button variant="primary" onClick={handleUpdateTask}>
                                                            Update Task
                                                        </Button>
                                                    </div>


                                                </Modal>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                    </div>
                </div>
            </div >
        </div >
    );
}

export default TODO;
