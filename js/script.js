// ======= Util: Debounce =======
const debounce = (context, func, delay) => {
  let timeout;

  return (...arguments) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, arguments);
    }, delay);
  };
};

// =======  Notification =======
const snackbar = document.querySelector(".snackbar");

function showNotification(message) {
  snackbar.textContent = message;
  snackbar.classList.add("show");

  setTimeout(function () {
    snackbar.classList.remove("show");
  }, 3000);
}

// ======= Generate Table =======
function generateTable(data) {
  const uploader = document.querySelector(".uploader");
  const table_wrapper = document.querySelector(".table_wrapper");

  const format = [
    "Fullname",
    "Phone Number",
    "Address",
    "State",
    "LGA",
    "Date of Birth",
    "Salary",
    "Gender",
    "Call Allowance",
    "Transport Allowance",
  ];

  const isValid =
    JSON.stringify(Object.keys(data[0])) === JSON.stringify(format);

  const isDataAvailable = Array.isArray(data) && data.length > 0;

  isDataAvailable
    ? (uploader.style.display = "none")
    : (uploader.style.display = "block");

  isDataAvailable
    ? (table_wrapper.style.display = "block")
    : (table_wrapper.style.display = "none");

  if (isValid) {
    const table = document.querySelector(".table");
    //  Clear existing data
    table.innerHTML = "";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    thead.classList.add("table_header");
    tbody.classList.add("table_body");

    table.appendChild(thead);
    table.appendChild(tbody);

    const header = document.createElement("tr");
    Object.keys(data[0]).forEach(function (item) {
      const cell = document.createElement("td");
      cell.textContent = item;
      header.appendChild(cell);
    });
    thead.appendChild(header);

    data.forEach(function (items) {
      const row = document.createElement("tr");
      Object.values(items).forEach(function (item) {
        const cell = document.createElement("td");
        cell.textContent = item;
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });
  } else {
    showNotification("Please use the right format");
  }
}

// ======= Convert File to JSON =======
let ExcelToJSON = function () {
  this.parseExcel = function (file) {
    const reader = new FileReader();
    const regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;

    if (regex.test(file.name.toLowerCase())) {
      if (typeof FileReader != "undefined") {
        if (reader.readAsBinaryString) {
          reader.onload = function (e) {
            let data = e.target.result;
            let workbook = XLSX.read(data, {
              type: "binary",
            });
            workbook.SheetNames.forEach(function (sheetName) {
              let row_object = XLSX.utils.sheet_to_row_object_array(
                workbook.Sheets[sheetName]
              );
              generateTable(row_object);
              dataToUpload = row_object;
            });
          };

          reader.onerror = function (error) {
            console.error(error);
          };

          reader.readAsBinaryString(file);
        }
      } else {
        showNotification("Please use a browser that support HTML5.");
      }
    } else {
      showNotification("Please upload a valid Excel file.");
    }
  };
};

// ======= Choose File  =======
let dataToUpload;

document
  .querySelector(".file_upload")
  .addEventListener("change", handleFileSelect);

function handleFileSelect(evt) {
  let files = evt.target.files;
  let xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
}

// ======= Upload File =======
document
  .querySelector("#save")
  .addEventListener("click", debounce(this, uploadData, 500));

function uploadData() {
  fetch("https://httpbin.org/anything", {
    method: "POST",
    body: JSON.stringify(dataToUpload),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then(() => {
      showNotification("Successfully uploaded file.");
    })
    .catch((error) => {
      console.error(error);
      showNotification("Failed to upload file.");
    });
}
