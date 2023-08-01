import React, { useState, useEffect } from "react";
import "./App.css";
import AWS from 'aws-sdk';
import axios from 'axios';


function App() {
  const [tasks, setTasks] = useState([]);
  const fetchAPI = process.env.REACT_APP_FETCH_TASK_API_URL;
  const sendToQueueAPI = process.env.REACT_APP_SEND_QUEUE_API_URL;
  const sendEmailAPI = process.env.REACT_APP_SEND_EMAIL_API_URL;
  const insertLambdaName = process.env.REACT_APP_INSERT_FUNCTION_NAME;
  const deleteLambdaName = process.env.REACT_APP_DELETE_FUNCTION_NAME;
  const editLambdaName = process.env.REACT_APP_EDIT_FUNCTION_NAME;
  AWS_SDK_LOAD_CONFIG = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(fetchAPI);
        const resData = JSON.parse(response.data.body);
        setTasks(resData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "Pending",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const addTask = () => {
    if (newTask.title.trim() !== "") {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setNewTask({ title: "", description: "", status: "pending" });
      callInsertLambdaFunction(newTask, Date.now());
    }
  };

  const callInsertLambdaFunction = async (data, id) => {
    const lambda = new AWS.Lambda({ region: 'us-east-1' });
    const newData = {
      id: id,
      ...data,
    };

    const params = {
      FunctionName: insertLambdaName,
      Payload: JSON.stringify(newData),
    };

    try {
      const result = await lambda.invoke(params).promise();
      console.log('Lambda function invoked successfully:', result);
      sendMessage('You just created a task!');
    } catch (error) {
      console.error('Error invoking Lambda function:', error);
    }
  }

  const editTask = (id, editedTask) => {
    callEditLambdaFunction(id);
  };

  const callEditLambdaFunction = async (id) => {
    const lambda = new AWS.Lambda({ region: 'us-east-1' });
    const editData = {
      id: id,
      newStatus: 'Completed'
    };
    const params = {
      FunctionName: editLambdaName,
      Payload: JSON.stringify(editData),
    };

    try {
      const result = await lambda.invoke(params).promise();
      console.log('Lambda function invoked successfully:', result);
      sendMessage('You just completed a task!');
      //window.location.reload();
    } catch (error) {
      console.error('Error invoking Lambda function:', error);
    }
  }

  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    callDeleteLambdaFunction(id);
  };

  const callDeleteLambdaFunction = async (id) => {
    const lambda = new AWS.Lambda({ region: 'us-east-1' });
    const deleteData = {
      id: id,
    };
    const params = {
      FunctionName: deleteLambdaName,
      Payload: JSON.stringify(deleteData),
    };

    try {
      const result = await lambda.invoke(params).promise();
      console.log('Lambda function invoked successfully:', result);
      sendMessage('You just deleted a note!');
    } catch (error) {
      console.error('Error invoking Lambda function:', error);
    }
  }

  async function sendMessage(text) {
    // const sendMessage = async (text) => {
    try {
      const textToSend = text;
      const response = await axios.post(sendToQueueAPI, { text: textToSend });
      if (response.data.statusCode === 200) {
        await axios.post(sendEmailAPI);
      }
      console.log('Message sent to queue');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  return (
    <><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" /><script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script><script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
      <div className="App">
        <h1>To-Do List Manager</h1>
        <div className="border" style={{ backgroundColor: "aliceblue" }}>
          <div className="row">
            <div className="col-md-4">
              <input
                type="text"
                name="title"
                value={newTask.title}
                placeholder="Task title"
                className="form-control"
                onChange={handleInputChange} />
            </div>
            <div className="col-md-5">
              <input
                type="text"
                name="description"
                value={newTask.description}
                placeholder="Task description"
                className="form-control"
                onChange={handleInputChange} />
            </div>
            <div className="col-md-3">
              <button className="form-control btn btn-primary" style={{ width: 100 }} onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
        <div className="border">
          {tasks.map((task) => (
            <div key={task.id} className="border">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
              {/* <button onClick={() => editTask(task.id)}>
              Mark as Completed
            </button> */}
              {task.status === "Pending" && (
                <button className="form-control btn btn-primary" style={{ width: 200 }} onClick={() => editTask(task.id)}>Mark as Completed</button>
              )}
              &ensp;
              <button className="form-control btn btn-danger" style={{ width: 100 }} onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div></>
  );
}

export default App;
