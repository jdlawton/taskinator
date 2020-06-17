var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var taskIdCounter = 0;
var pageContentEl = document.querySelector("#page-content");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var tasks = [];

var taskFormHandler = function(event) {
    
    event.preventDefault();

    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;

    //check if input values are empty strings
    if (!taskNameInput || !taskTypeInput) {
        alert("You need to fill out the task form!");
        return false;
    }
    
    formEl.reset();

    var isEdit = formEl.hasAttribute("data-task-id");


    //has data attribute, so get task id and call function to complete edit process
    if (isEdit) {
        var taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    }
    //no data attribute, so create object as normal and pass to createTaskEl function
    else {
        //package up data as an object
        var taskDataObj = {
            name: taskNameInput,
            type: taskTypeInput,
            status: "to do"
        };

        //send it as an argument to creatTaskEl
        createTaskEl(taskDataObj);
    }


    
}

var createTaskEl = function(taskDataObj) {

    // create list item
    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item";

    //add task id as a custom attribute
    listItemEl.setAttribute("data-task-id", taskIdCounter);

    //add drag and drop functionality
    listItemEl.setAttribute("draggable", "true");

    // create div to hold task info and add to list item
    var taskInfoEl = document.createElement("div");
    // give it a class name
    taskInfoEl.className = "task-info";
    // add HTML content to div
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";

    //append the <li> to the <div>
    listItemEl.appendChild(taskInfoEl);

    //add the task-id to the taskDataObj for use in storage
    taskDataObj.id = taskIdCounter;

    //add the taskDataObj to the array of tasks
    tasks.push(taskDataObj);

    //calls the function to create the buttons and dropdown on the task
    var taskActionsEl = createTaskActions(taskIdCounter);

    //append the task buttons/dropdown to the <div>
    listItemEl.appendChild(taskActionsEl);

    // append the <li> to the <ul>
    //if the status is "to do" append to tasksToDoEl
    //if the status is "in progress" append to tasksInProgressEl
    //if the status is "completed" append to the tasksCompletedEl
    //console.log(taskDataObj);
    var statusSelectEl = listItemEl.querySelector("select[name='status-change']");
    if (taskDataObj.status === "to do"){
        statusSelectEl.selectedIndex = 0;
        tasksToDoEl.appendChild(listItemEl);
    }
    else if (taskDataObj.status === "in progress") {
        statusSelectEl.selectedIndex = 1;
        tasksInProgressEl.appendChild(listItemEl);
    }
    else if (taskDataObj.status === "completed") {
        statusSelectEl.selectedIndex = 2;
        tasksCompletedEl.appendChild(listItemEl);
    }
    
    //increase task counter for next unique id
    taskIdCounter++;

    //save tasks to local storage for task persistence
    saveTasks();
}

var createTaskActions = function(taskId) {
    //create <div> that acts as a container for the other elements
    var actionContainerEl = document.createElement("div");
    actionContainerEl.className = "task-actions";

    //create edit button
    var editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);

    //append the new button to the <div>
    actionContainerEl.appendChild(editButtonEl);

    //create delete button
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    //append the new button to the <div>
    actionContainerEl.appendChild(deleteButtonEl);

    //create dropdown selector
    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);
    
    //creating options for the dropdown selector
    var statusChoices = ["To Do", "In Progress", "Completed"];
    for (var i = 0; i < statusChoices.length; i++) {
        //create option element
        var statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        //append to dropdown selector
        statusSelectEl.appendChild(statusOptionEl);
    }

    //append the new select element to the <div>
    actionContainerEl.appendChild(statusSelectEl);

    return actionContainerEl;
}

var taskButtonHandler = function(event) {
    //get target element from event
    var targetEl = event.target;

    //edit button was clicked
    if (targetEl.matches(".edit-btn")) {
        var taskId = targetEl.getAttribute("data-task-id");
        editTask(taskId);
    }

    //delete button was clicked
    else if(event.target.matches(".delete-btn")) {
        //get the element's task id
        var taskId = targetEl.getAttribute("data-task-id");
        deleteTask(taskId);
    }
}

var deleteTask = function(taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    //create new array to hold updated list of tasks
    var updatedTaskArr = [];

    //loop through current tasks array
    for (var i = 0; i < tasks.length; i++) {
        //if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
        if (tasks[i].id !== parseInt(taskId)) {
            updatedTaskArr.push(tasks[i]);
        }
    }

    //NOTE: When first adding tasks to the array, the tasks array index will match the id of the task items. As tasks are deleted, however
    //this can change. The array index and task id do not need to match because the index is not ever used to identify a task and the task id is never
    //used for anything related to iterating through the array.

    //reassign tasks array to be the same as updatedtaskArr
    tasks = updatedTaskArr;

    //save tasks to local storage for task persistence
    saveTasks();
}

var editTask = function(taskId) {
    console.log("editing task #" + taskId);

    //get task list item element
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //get content from task name and type
    var taskName = taskSelected.querySelector("h3.task-name").textContent;
    var taskType = taskSelected.querySelector("span.task-type").textContent;
    
    //fill the input elements with the values we grabbed from the task
    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;

    //update button text
    document.querySelector("#save-task").textContent = "Save Task";

    //save the task's taskId to an attribute on the form so we can ensure the same Id follows the task once it is updated
    formEl.setAttribute("data-task-id", taskId);
}

var completeEditTask = function(taskName, taskType, taskId) {
    //find matching task list <li> item
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //set new values
    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    //loop through tasks array and update task object with new content
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    }

    alert("Task Updated");
    //remote the data-task-id attribute from the form so new tasks can be added again
    //change the button text back to Add Task
    formEl.removeAttribute("data-task-id");
    document.querySelector("#save-task").textContent = "Add Task";

    //save tasks to local storage for task persistence
    saveTasks();
}

var taskStatusChangeHandler = function(event) {
    //get the task item's id
    var taskId = event.target.getAttribute("data-task-id");

    //get the currently selected option's value and convert to lowercase
    var statusValue = event.target.value.toLowerCase();

    //find the pargent task item element based on the id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //move the task to the appropriate status column
    if (statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    }
    else if (statusValue === "in progress") {
        tasksInProgressEl.appendChild(taskSelected);
    }
    else if (statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    }

    //update task's status in the tasks array
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }

    //save tasks to local storage for task persistence
    saveTasks();
}

//grabs the data-task-id and stores it in dataTransfer of a dragEvent when a task item is dragged
var dragTaskHandler = function(event) {
    var taskId = event.target.getAttribute("data-task-id");
    event.dataTransfer.setData("text/plain", taskId);
    var getId = event.dataTransfer.getData("text/plain");
}

var dropZoneDragHandler = function(event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
        event.preventDefault();
        taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");
    }
}

var dropTaskHandler = function(event) {
    var id = event.dataTransfer.getData("text/plain");
    var draggableElement = document.querySelector("[data-task-id='" + id + "']");

    var dropZoneEl = event.target.closest(".task-list");
    var statusType = dropZoneEl.id;
    
    //set status of task based on dropZone id
    var statusSelectEl = draggableElement.querySelector("select[name='status-change']");
    if (statusType === "tasks-to-do") {
        statusSelectEl.selectedIndex = 0;
    }
    else if (statusType === "tasks-in-progress") {
        statusSelectEl.selectedIndex = 1;
    }
    else if (statusType === "tasks-completed") {
        statusSelectEl.selectedIndex = 2;
    }

    dropZoneEl.removeAttribute("style");

    //append the dragged task to its new list
    dropZoneEl.appendChild(draggableElement);

    //loop through tasks array to update the dropped task's status
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(id)) {
            tasks[i].status = statusSelectEl.value.toLowerCase();
        }
    }
    //save tasks to local storage for task persistence
    saveTasks();
}

var dragLeaveHandler = function(event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
        taskListEl.removeAttribute("style");
    }
}

var saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

var loadTasks = function() {
    //1. gets task items from localStorage
    //2. convert tasks from the stringified format back into an array of objects
    //3. iterateS through tasks array and create task elements on the page from array info

    /*==================================================ORIGINAL CODE===========================================================================
    //load the tasks back from localStorage, they will be JSON strings
    tasks = localStorage.getItem("tasks");
    //check to see if tasks is null (nothing loaded), if tasks is null, make it an empty array and return out of this function.
    if (tasks === null) {
        tasks = [];
        return false;
    }
    //if we pulled data from localStorage, parse it back into our array of objects.
    tasks = JSON.parse(tasks);

    //loop through the tasks array and recreate the visible task items according to the data stored in the array.
    for (i = 0; i < tasks.length; i++) {
        tasks[i].id = taskIdCounter;
        
        //create the <li> items, add a class and set the task-id and draggable attributes
        var listItemEl = document.createElement("li");
        listItemEl.className = "task-item";
        listItemEl.setAttribute("data-task-id", tasks[i].id);
        listItemEl.setAttribute("draggable", "true");

        //create the <div> that holds the <li>'s children elements, assign a class and form its innerHTML, append it to the <li>
        var taskInfoEl = document.createElement("div");
        taskInfoEl.className = "task-info";
        taskInfoEl.innerHTML = "<h3 class='task-name'>" + tasks[i].name + "</h3><span class='task-type'>" + tasks[i].type + "</span>";
        listItemEl.appendChild(taskInfoEl);

        //call the createTaskActions function to add the Edit, Delete and dropdown on the task item, append them to the <li> element
        var taskActionsEl = createTaskActions(tasks[i].id);
        listItemEl.appendChild(taskActionsEl);

        //assign the drop down status based on tasks[i].status. this will also put the task item in the correct task list (column).
        if (tasks[i].status === "to do") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
            tasksToDoEl.appendChild(listItemEl);
        }
        else if (tasks[i].status === "in progress") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 1
            tasksInProgressEl.appendChild(listItemEl);
        }
        else if (tasks[i].status === "complete") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 2;
            tasksCompletedEl.appendChild(listItemEl);
        }
        taskIdCounter++;
        console.log(listItemEl);
    }
    ================================================================END ORIGINAL CODE===============================================================*/
    //tasks = localStorage.getItem("tasks");
    var savedTasks = localStorage.getItem("tasks");

    if (!savedTasks) {
        return false;
    }

    savedTasks = JSON.parse(savedTasks);
    //loop through savedTasks array
    for (var i = 0; i < savedTasks.length; i++) {
        //pass each task object into the createTaskEL() function
        createTaskEl(savedTasks[i]);
    }

}

//event listeners
formEl.addEventListener("submit", taskFormHandler);
pageContentEl.addEventListener("click", taskButtonHandler);
pageContentEl.addEventListener("change", taskStatusChangeHandler);
pageContentEl.addEventListener("dragstart", dragTaskHandler);
pageContentEl.addEventListener("dragover", dropZoneDragHandler);
pageContentEl.addEventListener("drop", dropTaskHandler);
pageContentEl.addEventListener("dragleave", dragLeaveHandler);

loadTasks();