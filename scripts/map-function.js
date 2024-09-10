const sineg_map = document.getElementById("mapfunction");
const sideData = document.getElementById("sidedata")

const statusMap = {
    "color": {
        "active": "green", 
        "warning": "yellow", 
        "offline": "red" 
    },

    "icon": {
        "active": "sentiment_satisfied", 
        "warning": "sentiment_dissatisfied", 
        "offline": "sentiment_very_dissatisfied" 
    }
}

const menuTemplate = `
        <div class="closebutton" id="sideinfoclose">
            <span class="material-symbols-outlined">
                close
            </span>
        </div>

        <div class="title" id="title-info">
            <h2>--title--</h2>
        </div>
        <hr>
        <div class="info">--data--</div>
    `

const dataTemplate = `
        <div class="closebutton" id="sidedataclose">
            <span class="material-symbols-outlined">
                close
            </span>
        </div>

        <div class="title" id="title-info">
            <h2>--title--</h2>
        </div>
        <hr>
        <div class="info">--data--</div>
    `

const onlineCounter = document.getElementById("onlineCounter");
const activeList = document.getElementById("active-list");
const warningList = document.getElementById("warning-list");
const offlineList = document.getElementById("offline-list");
const menuList = document.getElementById("menu-setting");
const innovations = document.querySelectorAll(".innovation");
const sideInfo = document.getElementById("sideinfo");

var tuboList = []
var totalTubo = {}
var totalOnline = 0;
var CurrentData = {}

var pastRecord = localStorage.getItem("pastData");

if (pastRecord != null) {
    CurrentData = JSON.parse(pastRecord);
    LoadWebsite();
}

fetch("https://lrc.pythonanywhere.com/getData")
    .then(response => {
      return response.json();
    })

    .then(data => {
        CurrentData = data;
        localStorage.setItem("pastData", JSON.stringify(CurrentData))
        LoadWebsite();
    });

function LoadWebsite() {
    var totalTubo = CurrentData["tubo"].length

    for (let i = 0; i < CurrentData["tubo"].length; i++) {
        let curData = CurrentData["tubo"][i];
    
        let newInnovation = document.createElement("div");
        let statusDiv = document.createElement("div");
        let innovationName = document.createElement('h2');
        let innovationIcon = document.createElement('span');
    
        newInnovation.className = "innovation"
        newInnovation.id = curData["idx"];
    
        newInnovation.style.top = curData["locy"];
        newInnovation.style.right = curData["locx"];
    
        statusDiv.className = `status-icon ${statusMap["color"][curData["status"]]}`
    
        if (curData["status"] == "active" || curData["status"] == "warning") {
            totalOnline++;
        }
    
        innovationName.textContent = curData["name"]
    
        innovationIcon.className = "material-symbols-outlined";
        innovationIcon.textContent = statusMap["icon"][curData["status"]];
    
        statusDiv.appendChild(innovationName);
        statusDiv.appendChild(innovationIcon);
        newInnovation.appendChild(statusDiv);
        sineg_map.appendChild(newInnovation);
    
        newInnovation.addEventListener("click", function() {
            let info = dataTemplate;
            info = info.replace("--title--", curData["name"]);
    
            let message = "";
    
            if (curData["message"].length != 0) {
                for (let i = 0; i < curData["message"].length; i++) {
                    message += `• ${curData["message"][i]} <br>`
                }
            }
    
            else {
                message = "• No messages to display! Yay!"
            }
    
            info = info.replace("--data--", `<p><span class="material-symbols-outlined">device_thermostat</span> Temperature: ${curData["temperature"]}</p> <p><span class="material-symbols-outlined">humidity_percentage</span> Humidity: ${curData["humidity"]} </p><p><span class="material-symbols-outlined">water</span> Water Level: ${curData["waterlevel"]}</p><p><span class="material-symbols-outlined">water_ph</span> pH Level: ${curData["pH"]}</p><p><span class="material-symbols-outlined">nutrition</span> Nutrients: ${curData["nutrients"]}</p><p><span class="material-symbols-outlined">rainy</span> Raining: ${curData["rain"]}</p> <hr> <h4>${curData["timeUpdated"]}</h4> <br> <p>${message}</p>`)
            sideData.innerHTML = info;
            sideData.className = "sidedata active";
            ActivateCloseButton();
        })
    
        tuboList.push(newInnovation)
    }

    onlineCounter.textContent = `${totalOnline} / ${totalTubo}`
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

function ActivateCloseButton() {
    let closebutton = document.querySelectorAll(".closebutton");
    for (let i = 0; i < closebutton.length; i++) {
        closebutton[i].addEventListener("click", function() {
            let targetElement = closebutton[i].id.replace("close", "")
            document.getElementById(targetElement).className = targetElement;
        })
    }
}

function ActivateHyperAction() {
    let allTuboElements = document.querySelectorAll(".tuboproj")

    for (let i = 0; i < allTuboElements.length; i++) {
        allTuboElements[i].addEventListener("click", function() {
            tuboList[parseInt(allTuboElements[i].id.replace("idx", ""))].click()
        })
    }
}

function openMenu() {
    let info = menuTemplate;

    info = info.replace("--title--", "All Tubo Projects: ");

    let infoData = ""
    let Checker = false;

    for (let i = 0; i < CurrentData["tubo"].length; i++) {
        Checker = true;
        infoData +=  `
            <div class="tuboproj" id="idx${i}">
                <h2>${CurrentData["tubo"][i]["name"]}</h2>
                <p class="${statusMap["color"][CurrentData["tubo"][i]["status"]]}">${toTitleCase(CurrentData["tubo"][i]["status"])}</p>
            </div>
        `
    }

    if (!Checker) {
        info = info.replace("--data--", "N/A")
    }
    
    else {
        info = info.replace("--data--", infoData)
    }

    sideInfo.innerHTML = info;
    sideInfo.className = "sideinfo active";
    ActivateCloseButton();
    ActivateHyperAction();
}

function openActive() {
    let info = menuTemplate;

    info = info.replace("--title--", "Active Tubo Projects: ");

    let infoData = ""
    let Checker = false;

    for (let i = 0; i < CurrentData["tubo"].length; i++) {
        if (CurrentData["tubo"][i]["status"] == "active") {
            Checker = true;
            infoData +=  `
            <div class="tuboproj" id="idx${i}">
                <h2>${CurrentData["tubo"][i]["name"]}</h2>
                <p class="${statusMap["color"][CurrentData["tubo"][i]["status"]]}">${toTitleCase(CurrentData["tubo"][i]["status"])}</p>
            </div>
        `
        }
    }

    if (!Checker) {
        info = info.replace("--data--", "N/A")
    }
    
    else {
        info = info.replace("--data--", infoData)
    }

    sideInfo.innerHTML = info;
    sideInfo.className = "sideinfo active";
    ActivateCloseButton();
    ActivateHyperAction();
}

function openWarning() {
    let info = menuTemplate;

    info = info.replace("--title--", "Danger Tubo Projects: ");

    let infoData = ""
    let Checker = false;

    for (let i = 0; i < CurrentData["tubo"].length; i++) {
        if (CurrentData["tubo"][i]["status"] == "warning") {
            Checker = true;
            infoData +=  `
            <div class="tuboproj" id="idx${i}">
                <h2>${CurrentData["tubo"][i]["name"]}</h2>
                <p class="${statusMap["color"][CurrentData["tubo"][i]["status"]]}">${toTitleCase(CurrentData["tubo"][i]["status"])}</p>
            </div>
        `
        }
    }

    if (!Checker) {
        info = info.replace("--data--", "N/A")
    }
    
    else {
        info = info.replace("--data--", infoData)
    }

    sideInfo.innerHTML = info;
    sideInfo.className = "sideinfo active";
    ActivateCloseButton();
    ActivateHyperAction();
}

function openOffline() {
    let info = menuTemplate;

    info = info.replace("--title--", "Offline Tubo Projects: ");

    let infoData = ""
    let Checker = false;

    for (let i = 0; i < CurrentData["tubo"].length; i++) {
        if (CurrentData["tubo"][i]["status"] == "offline") {
            Checker = true;
            infoData +=  `
            <div class="tuboproj" id="idx${i}">
                <h2>${CurrentData["tubo"][i]["name"]}</h2>
                <p class="${statusMap["color"][CurrentData["tubo"][i]["status"]]}">${toTitleCase(CurrentData["tubo"][i]["status"])}</p>
            </div>
        `
        }
    }

    if (!Checker) {
        info = info.replace("--data--", "N/A")
    }
    
    else {
        info = info.replace("--data--", infoData)
    }

    sideInfo.innerHTML = info;
    sideInfo.className = "sideinfo active";
    ActivateCloseButton();
    ActivateHyperAction();
}

menuList.addEventListener("click", openMenu)

activeList.addEventListener("click", openActive)

warningList.addEventListener("click", openWarning)

offlineList.addEventListener("click", openOffline)