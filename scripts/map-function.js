const sineg_map = document.getElementById("mapfunction");
const sideData = document.getElementById("sidedata")

const statusMap = {
    "color": {
        "active": "green", 
        "warning": "yellow", 
        "offline": "red" 
    },

    "icon": {
        "active": "recommend", 
        "warning": "error", 
        "offline": "wifi_off" 
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
        <div class="buttonSelection">
            <button class="sideButton" id="tuboprev">Image Preview</button>
            <button class="sideButton" id="reqImg">Request Image</button>
        </div>
    `

const imgPrevTemplate = `
        <div class="container">
            <div class="closebutton" id="imgprev">
                <span class="material-symbols-outlined">
                    close
                </span>
            </div>
            <h2>--TUBONAME--</h2>
            <div class="img-container">
                <div class="control" id="prev">
                    <span class="material-symbols-outlined">
                        arrow_back_ios
                    </span>
                </div>
                <div class="img-wrapper">
                    <img src="" alt="" id="imgpreview">
                </div>
                <div class="control" id="next">
                    <span class="material-symbols-outlined">
                        arrow_forward_ios
                    </span>
                </div>
            </div>
        </div>
`

var current_selected = null;
var current_nodes = [];

const onlineCounter = document.getElementById("onlineCounter");
const activeList = document.getElementById("active-list");
const warningList = document.getElementById("warning-list");
const offlineList = document.getElementById("offline-list");
const menuList = document.getElementById("menu-setting");
const innovations = document.querySelectorAll(".innovation");
const sideInfo = document.getElementById("sideinfo");

const LoadingMSG = document.getElementById("loading-msg");
const imagePreview = document.getElementById("ImagePreview");
const LoadingPanel = document.getElementById("loading");

var curDataTemp = {}
var curClicked = "NO";
var focus = true;
var tuboList = []
var totalTubo = {}
var totalOnline = 0;
var CurrentData = {}
var CurrentIDX = 0;
var CurrentPrevTubo = 1;

function Startup(reload = false) {
    var pastRecord = localStorage.getItem("pastData");

    if (pastRecord != null) {
        CurrentData = JSON.parse(pastRecord);
        if (!reload) {
            LoadWebsite();
        }
    }

    document.getElementById("loadingclose").addEventListener("click", function() {
        LoadingPanel.className = "loading-screen";
    })

    fetch("https://lrc.pythonanywhere.com/getData")
        .then(response => {
            return response.json();
        })

        .then(data => {
            CurrentData = data;
            localStorage.setItem("pastData", JSON.stringify(CurrentData))
            LoadWebsite();
        });
}

Startup();

function LoadWebsite() {
    var totalTubo = CurrentData["tubo"].length;

    totalOnline = 0;

    current_nodes = [];

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
    
        if (curData["status"] != "offline") {
            totalOnline++;
        }
    
        innovationName.textContent = curData["name"]
    
        innovationIcon.className = "material-symbols-outlined";
        innovationIcon.textContent = statusMap["icon"][curData["status"]];
    
        statusDiv.appendChild(innovationName);
        statusDiv.appendChild(innovationIcon);
        newInnovation.appendChild(statusDiv);
        sineg_map.appendChild(newInnovation);
        
        current_nodes.push(newInnovation);

        newInnovation.addEventListener("click", function handleSidebar() {
            current_selected = i;
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
    
            info = info.replace("--data--", `<p><span class="material-symbols-outlined">device_thermostat</span> Temperature: ${curData["temperature"]}</p> <p><span class="material-symbols-outlined">humidity_percentage</span> Humidity: ${curData["humidity"]} </p><p><span class="material-symbols-outlined">water</span> Water Level: ${curData["waterlevel"]}</p><p><span class="material-symbols-outlined">water_ph</span> pH Level: ${parseInt(curData["pH"])}</p><p><span class="material-symbols-outlined">dew_point</span> Soil Moisture: ${curData["moisture"]}</p><p><span class="material-symbols-outlined">thermostat</span> Soil Temperature: ${curData["soiltemp"]}</p><p><span class="material-symbols-outlined">water_ec</span> Soil Conductivity: ${curData["soilconduct"]}</p><p><span class="material-symbols-outlined">rainy</span> Raining: ${curData["rain"]}</p> <hr> <h4>${curData["timeUpdated"]}</h4> <br> <p>${message}</p>`)
            sideData.innerHTML = info;
            sideData.className = "sidedata active";

            let previewbutton = document.getElementById("tuboprev");
            let requestbutton = document.getElementById("reqImg");

            let curTubo = parseInt(curData["idx"].replace("idx", "")) + 1;

            previewbutton.addEventListener("click", function() {
                imagePreview.className = "imgPreview active";
                let currentTemplate = imgPrevTemplate.replace("--TUBONAME--", curData["name"])
                CurrentPrevTubo = curTubo
                imagePreview.innerHTML = currentTemplate
                document.getElementById("imgpreview").src = `https://lrc.pythonanywhere.com/getimage/${CurrentPrevTubo}/picture${CurrentIDX}.jpg`
                ActivatePictureButtons();
            })

            requestbutton.addEventListener("click", function() {
                fetch(`https://lrc.pythonanywhere.com/requestImage?tubo=${curTubo}`)
                    .then(response => {
                        return response.text();
                    })
                    .then(data => {
                        if (data == "BUSY") {
                            LoadingPanel.className = "loading-screen active";

                            LoadingMSG.textContent = "Currently busy! Please try again later!"
                        }

                        else if (data == "OFFLINE") {
                            LoadingPanel.className = "loading-screen active";

                            LoadingMSG.textContent = "Device is offline! Please try again later!"
                        }

                        else {
                            LoadingPanel.className = "loading-screen active";
                            LoadingMSG.textContent = "Requesting data, Please wait for at least a minute and reload the page!"
                        }
                    })
            })

            curDataTemp = i;
            curClicked = handleSidebar;
            ActivateCloseButton();
        })
    
        tuboList.push(newInnovation)
    }
    onlineCounter.textContent = `${totalOnline} / ${totalTubo}`;

    if (current_selected != null) {
        current_nodes[current_selected].click();
    }
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
            curClicked = "NO";
            let targetElement = closebutton[i].id.replace("close", "")
            document.getElementById(targetElement).className = targetElement;
            current_selected = null;
        })
    }

    
}

function ActivateHyperAction() {
    let allTuboElements = document.querySelectorAll(".tuboproj")
    for (let i = 0; i < allTuboElements.length; i++) {
        allTuboElements[i].addEventListener("click", function() {
            tuboList[parseInt(allTuboElements[i].id.replace("idx", ""))].click()
            curClicked = tuboList[parseInt(allTuboElements[i].id.replace("idx", ""))].click;
        })
    }
}

function ActivatePictureButtons() {
    let closeButton = document.getElementById("imgprev");
    let prevButton = document.getElementById("prev");
    let nextButton = document.getElementById("next");

    let curImg = document.getElementById("imgpreview");

    CurrentIDX = 0;

    prevButton.addEventListener("click", function() {
        if (CurrentIDX == 0) {
            return;
        }

        else {
            CurrentIDX--;
            curImg.src = `https://lrc.pythonanywhere.com/getimage/${CurrentPrevTubo}/picture${CurrentIDX}.jpg`
        }
    }) 

    nextButton.addEventListener("click", function() {
        if (CurrentIDX == 7) {
            return;
        }

        else {
            CurrentIDX++;
            curImg.src = `https://lrc.pythonanywhere.com/getimage/${CurrentPrevTubo}/picture${CurrentIDX}.jpg`
        }
    }) 

    closeButton.addEventListener("click", function() {
        imagePreview.className = "imgPreview";
    })
}

function openMenu() {
    let info = menuTemplate;
    info = info.replace("--title--", "All BMS Devices ");

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
        info = info.replace("--data--", "")
    }
    
    else {
        info = info.replace("--data--", infoData)
    }

    sideInfo.innerHTML = info;
    sideInfo.className = "sideinfo active";
    curClicked = openMenu;
    ActivateCloseButton();
    ActivateHyperAction();
}

function openActive() {
    let info = menuTemplate;
    info = info.replace("--title--", "Active BMS Devices: ");

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
        info = info.replace("--data--", "")
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
    info = info.replace("--title--", "Dangered BMS Devices:");

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
        info = info.replace("--data--", "")
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
    info = info.replace("--title--", "Offline BMS Devices: ");

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
        info = info.replace("--data--", "")
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

document.addEventListener("DOMContentLoaded", async function() {
     await sleep(5000);
     while (true) {
        if (focus) {
            console.log("Reloading data....");
            if (curClicked != "NO") {
                Startup(true);

                curData = CurrentData["tubo"][curDataTemp];
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
        
                info = info.replace("--data--", `<p><span class="material-symbols-outlined">device_thermostat</span> Temperature: ${curData["temperature"]}</p> <p><span class="material-symbols-outlined">humidity_percentage</span> Humidity: ${curData["humidity"]} </p><p><span class="material-symbols-outlined">water</span> Water Level: ${curData["waterlevel"]}</p><p><span class="material-symbols-outlined">water_ph</span> pH Level: ${parseInt(curData["pH"])}</p><p><span class="material-symbols-outlined">dew_point</span> Soil Moisture: ${curData["moisture"]}</p><p><span class="material-symbols-outlined">thermostat</span> Soil Temperature: ${curData["soiltemp"]}</p><p><span class="material-symbols-outlined">water_ec</span> Soil Conductivity: ${curData["soilconduct"]}</p><p><span class="material-symbols-outlined">rainy</span> Raining: ${curData["rain"]}</p> <hr> <h4>${curData["timeUpdated"]}</h4> <br> <p>${message}</p>`)
                sideData.innerHTML = info;
                ActivateCloseButton();
            }
        }
        await sleep(3000);
    }
})

window.onblur = function(){
    focus = false;
    document.title = "COME BACK!";
}

window.onfocus = function() {
    focus = true;
    document.title = "PROJECT BMS";
}