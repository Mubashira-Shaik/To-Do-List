document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.getElementById("addButton");
    const inputField = document.getElementById("inputField");
    const reminderInput = document.getElementById("reminderInput");
    const toDoContainer = document.getElementById("toDoContainer");
    const priorityInput = document.getElementById("priorityInput");

    // Retrieve saved to-do items from local storage
    const savedItems = JSON.parse(localStorage.getItem("toDoItems")) || [];

    // Function to schedule reminders
    function scheduleReminder(reminderDateTime, task) {
        const reminderTime = new Date(reminderDateTime);
        const currentTime = new Date();
        const timeDifference = reminderTime.getTime() - currentTime.getTime();

        if (timeDifference > 0) {
            setTimeout(function () {
                alert("Reminder: " + task);
            }, timeDifference);
        }
    }

    // Function to render to-do items
    function renderToDoItem(itemText, reminder, priority) {
        const newItem = document.createElement("div");
        newItem.classList.add("todo-item");
        newItem.innerHTML = `
            <input type="checkbox">
            <span class="text">${itemText}</span>
            <span class="reminder">${reminder}</span>
            <span class="priority">${priority}</span>
            <button class="editButton">Edit</button>
            <button class="deleteButton">Delete</button>
        `;
        toDoContainer.appendChild(newItem);
        scheduleReminder(reminder, itemText);
    }

    // Render saved to-do items
    savedItems.forEach(item => {
        renderToDoItem(item.text, item.reminder, item.priority);
    });

    // Save items to localStorage
    function saveToDoItems() {
        const items = Array.from(document.querySelectorAll(".todo-item")).map(item => {
            return {
                text: item.querySelector(".text").textContent,
                reminder: item.querySelector(".reminder").textContent,
                priority: item.querySelector(".priority").textContent
            };
        });
        localStorage.setItem("toDoItems", JSON.stringify(items));
    }

    // Format reminder datetime
    function formatReminder(dateTimeString) {
        if (!dateTimeString) return "";
        const dateTime = new Date(dateTimeString);

        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const day = String(dateTime.getDate()).padStart(2, '0');
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // Edit or delete actions
    toDoContainer.addEventListener("click", function (event) {
        const target = event.target;
        const parentItem = target.closest(".todo-item");

        if (target.classList.contains("deleteButton")) {
            parentItem.remove();
            saveToDoItems();
        } else if (target.classList.contains("editButton")) {
            const textSpan = parentItem.querySelector(".text");
            const newText = prompt("Edit your to-do item:", textSpan.textContent);
            if (newText !== null && newText.trim() !== "") {
                textSpan.textContent = newText.trim();
                saveToDoItems();
            }
        }
    });

    // Add new to-do item
    addButton.addEventListener("click", function () {
        const newItemText = inputField.value.trim();
        const reminderDateTime = reminderInput.value;
        const priority = priorityInput.value;

        if (newItemText !== "") {
            const newItem = {
                text: newItemText,
                reminder: formatReminder(reminderDateTime),
                priority: priority
            };

            renderToDoItem(newItem.text, newItem.reminder, newItem.priority);
            inputField.value = "";
            reminderInput.value = "";
            priorityInput.value = "low";

            fetch('save.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Success:', data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            saveToDoItems();
        }
    });
});
