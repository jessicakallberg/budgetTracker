const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/budget";

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
});

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
request.onsuccess = function(event) {
    // when db is successfully created save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadBudgetEntry() function to send all local db data to api
    if (navigator.onLine) {
      uploadBudgetEntry();
    }
  };
  
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };
  
  // Executed if attempt to submit a new entry and there's no internet
  function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_budget_entry'], 'readwrite');
  
    // access the object store for `new_budget_entry`
    const budgetObjectStore = transaction.objectStore('new_budget_entry');
  
    budgetObjectStore.add(record);
      alert("Offline Mode: Update saved successfully");
  }
  
  function uploadBudgetEntry() {
    const transaction = db.transaction(['new_budget_entry'], 'readwrite');
  
    const budgetObjectStore = transaction.objectStore('new_budget_entry');
  
    const getAll = budgetObjectStore.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch('/api/transaction', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
  
            const transaction = db.transaction(['new_budget_entry'], 'readwrite');
            const budgetObjectStore = transaction.objectStore('new_budget_entry');
           
            budgetObjectStore.clear();
  
            alert("Update: All pending offline transactions have been posted!");
          })
          .catch(err => {
            console.log(err);
          });
      }
    };
  }
  
  window.addEventListener('online', uploadBudgetEntry);