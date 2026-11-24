/* =====================================================================
   PawPals – Local Pet Assistance Network
   File   : script.js  (ONE script shared by every page)
   Team   : Pixel Pioneers (K3P26YG) – CSE326 Internet Programming
   ---------------------------------------------------------------------
   HOW THIS FILE IS ORGANISED
     1. Starter data          – arrays of objects (pets, volunteers, requests)
     2. Saving & loading      – keeps data when you change page
     3. Helper functions      – small reusable functions
     4. HOME page code
     5. PETS page code        – pet profiles
     6. VOLUNTEERS page code  – volunteer profiles, report / block
     7. REQUESTS page code    – requests, matching, scheduling,
                                acceptance, completion, ratings
     8. ADMIN page code       – verification
     9. Start-up              – decides which page code to run

   Every page loads this same file. Each page's <body> has a
   data-page attribute (e.g. data-page="pets") and section 9 uses it
   to run only the code for that page.
   ===================================================================== */


/* ---------- 1. STARTER DATA ------------------------------------------
   Each pet / volunteer / request is an OBJECT with properties.
   They are grouped in ARRAYS. Edit or add entries to change the demo.  */

const AREAS = ["Phagwara", "Jalandhar", "Ludhiana", "Amritsar"];
const SERVICES = ["Walking", "Fostering", "Transport", "Pet Sitting"];

// "photo" is a path inside the  folder. Leave it as "" and the
// card shows an emoji instead (new pets added from the form do this).
const starterPets = [
  { id: 1, name: "Bruno", species: "Dog", breed: "Golden Retriever", age: 1,
    owner: "Riya Sharma", area: "Phagwara", notes: "Friendly puppy, loves carrying flowers.",
    photo: "hero-dog.jpg" },
  { id: 2, name: "Misty", species: "Cat", breed: "Indie", age: 2,
    owner: "Aman Gill", area: "Jalandhar", notes: "Shy with strangers at first.",
    photo: "cat.jpg" },
  { id: 3, name: "Coco", species: "Dog", breed: "Beagle", age: 3,
    owner: "Neha Verma", area: "Phagwara", notes: "Very energetic – needs two walks a day.",
    photo: "walking-dog.jpg" },
  { id: 4, name: "Mochi", species: "Dog", breed: "French Bulldog", age: 1,
    owner: "Karan Arora", area: "Ludhiana", notes: "Gets cold easily – wears a hoodie outside.",
    photo: "transport-dog.jpg" }
];

const starterVolunteers = [
  { id: 1, name: "Arjun Mehta", area: "Phagwara", services: ["Walking", "Transport"],
    about: "Student at LPU, grew up with dogs.", status: "verified",
    blocked: false, ratings: [5, 4, 5], reports: 0 },
  { id: 2, name: "Simran Kaur", area: "Jalandhar", services: ["Fostering", "Pet Sitting"],
    about: "Has fostered 6 cats so far.", status: "verified",
    blocked: false, ratings: [5, 5], reports: 0 },
  { id: 3, name: "Kabir Singh", area: "Phagwara", services: ["Pet Sitting", "Walking"],
    about: "Works from home, flexible hours.", status: "verified",
    blocked: false, ratings: [4], reports: 0 },
  { id: 4, name: "Pooja Rani", area: "Ludhiana", services: ["Transport"],
    about: "Owns a car, can do vet drop-offs.", status: "pending",
    blocked: false, ratings: [], reports: 0 }
];

const starterRequests = [
  { id: 1, petId: 1, type: "Walking", area: "Phagwara", date: "2026-11-28",
    time: "07:30", notes: "30-minute morning walk.", status: "Open",
    volunteerId: null, rating: null },
  { id: 2, petId: 2, type: "Fostering", area: "Jalandhar", date: "2026-12-02",
    time: "10:00", notes: "Owner travelling for 4 days.", status: "Accepted",
    volunteerId: 2, rating: null },
  { id: 3, petId: 4, type: "Transport", area: "Ludhiana", date: "2026-12-05",
    time: "16:00", notes: "Drop-off at the groomer.", status: "Open",
    volunteerId: null, rating: null }
];


/* ---------- 2. SAVING & LOADING --------------------------------------
   localStorage is the browser's small storage box. It only stores
   text, so JSON.stringify turns objects into text and JSON.parse turns
   text back into objects. Without this, data added on one page would
   disappear when you open another page.                               */

function loadData(key, starterValue) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    return starterValue;          // first visit → use starter data
  }
  return JSON.parse(saved);
}

function saveAll() {
  localStorage.setItem("pets", JSON.stringify(pets));
  localStorage.setItem("volunteers", JSON.stringify(volunteers));
  localStorage.setItem("requests", JSON.stringify(requests));
}

// If the starter data above changes shape (e.g. we added "photo"), bump
// this number so old saved data in the browser is thrown away.
const DATA_VERSION = "3";
if (localStorage.getItem("version") !== DATA_VERSION) {
  localStorage.clear();
  localStorage.setItem("version", DATA_VERSION);
}

// "let" because these arrays change while the site is used
let pets = loadData("pets", starterPets);
let volunteers = loadData("volunteers", starterVolunteers);
let requests = loadData("requests", starterRequests);

// Clears saved data and goes back to the starter data (used on Admin page)
function resetDemoData() {
  if (confirm("Reset all data back to the demo data?")) {
    localStorage.clear();
    location.reload();
  }
}


/* ---------- 3. HELPER FUNCTIONS -------------------------------------- */

// Next id = biggest existing id + 1
function nextId(list) {
  let maxId = 0;
  list.forEach(function (item) {
    if (item.id > maxId) maxId = item.id;
  });
  return maxId + 1;
}

// Find one object in an array by its id (returns undefined if missing)
function findById(list, id) {
  return list.find(item => item.id === id);
}

// Average of a volunteer's ratings, e.g. [5, 4, 5] → 4.7
function averageRating(volunteer) {
  if (volunteer.ratings.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < volunteer.ratings.length; i++) {
    total += volunteer.ratings[i];
  }
  return Math.round((total / volunteer.ratings.length) * 10) / 10;
}

// Turns 4.3 into "★★★★☆ 4.3 (3)"
function starText(volunteer) {
  const avg = averageRating(volunteer);
  if (avg === 0) return "No ratings yet";
  const full = Math.round(avg);
  return '<span class="stars">' + "★".repeat(full) + "☆".repeat(5 - full) +
         "</span> " + avg + " (" + volunteer.ratings.length + ")";
}

// Emoji picture for each species (switch statement)
function petEmoji(species) {
  switch (species) {
    case "Dog":    return "🐶";
    case "Cat":    return "🐱";
    case "Bird":   return "🐦";
    case "Rabbit": return "🐰";
    default:       return "🐾";
  }
}

// Pet picture for a card: the photo if there is one, else a big emoji
function petPhoto(pet) {
  if (pet.photo) {
    return `<div class="card-photo"><img src="${pet.photo}" alt="Photo of ${pet.name}"></div>`;
  }
  return `<div class="card-photo photo-placeholder">${petEmoji(pet.species)}</div>`;
}

// Small round picture for table rows
function petThumb(pet) {
  if (pet.photo) {
    return `<img class="thumb" src="${pet.photo}" alt="">`;
  }
  return petEmoji(pet.species) + " ";
}

// "Arjun Mehta" → "AM"  (string methods: split, map, charAt, join)
function initials(name) {
  return name.split(" ").map(word => word.charAt(0)).join("").toUpperCase().slice(0, 2);
}

// Fills a <select> with <option>s from an array of strings
function fillSelect(selectId, options) {
  const select = document.getElementById(selectId);
  if (!select) return;
  options.forEach(function (text) {
    select.innerHTML += "<option>" + text + "</option>";
  });
}

// A volunteer is "available" only if verified AND not blocked
function isAvailable(volunteer) {
  return volunteer.status === "verified" && !volunteer.blocked;
}

// Shows a short message under a form, then hides it after 3 seconds
function showMessage(elementId, text) {
  const box = document.getElementById(elementId);
  box.textContent = text;
  setTimeout(function () { box.textContent = ""; }, 3000);
}

// Turns "2026-11-28" into "28 Nov 2026"
function niceDate(dateText) {
  const d = new Date(dateText);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}


/* ---------- 4. HOME PAGE --------------------------------------------- */
function initHome() {
  // Statistics – counted with filter()
  document.getElementById("stat-pets").textContent = pets.length;
  document.getElementById("stat-volunteers").textContent =
    volunteers.filter(isAvailable).length;
  document.getElementById("stat-open").textContent =
    requests.filter(r => r.status === "Open").length;
  document.getElementById("stat-done").textContent =
    requests.filter(r => r.status === "Completed").length;

  // Top 3 volunteers by rating: copy → sort → take first 3
  const top = volunteers
    .filter(isAvailable)
    .sort((a, b) => averageRating(b) - averageRating(a))
    .slice(0, 3);

  const box = document.getElementById("top-volunteers");
  box.innerHTML = "";
  top.forEach(function (v) {
    box.innerHTML += `
      <article class="card">
        <div class="avatar">${initials(v.name)}</div>
        <h3>${v.name}</h3>
        <p>📍 ${v.area}</p>
        <p>${starText(v)}</p>
        <div>${v.services.map(s => '<span class="tag">' + s + "</span>").join("")}</div>
      </article>`;
  });
}


/* ---------- 5. PETS PAGE (pet profiles) ------------------------------ */
function initPets() {
  fillSelect("pet-area", AREAS);
  renderPets();

  document.getElementById("pet-form").addEventListener("submit", function (event) {
    event.preventDefault();               // stop the page from reloading

    // Build a new pet object from the form values
    const newPet = {
      id: nextId(pets),
      name: document.getElementById("pet-name").value.trim(),
      species: document.getElementById("pet-species").value,
      breed: document.getElementById("pet-breed").value.trim() || "Unknown",
      age: Number(document.getElementById("pet-age").value),
      owner: document.getElementById("pet-owner").value.trim(),
      area: document.getElementById("pet-area").value,
      notes: document.getElementById("pet-notes").value.trim(),
      photo: ""                           // no photo → emoji placeholder
    };

    pets.push(newPet);                    // add to the array
    saveAll();
    renderPets();
    this.reset();                         // clear the form
    showMessage("pet-msg", "✅ " + newPet.name + "'s profile was added!");
  });

  // Live search: re-draw the list every time the user types
  document.getElementById("pet-search").addEventListener("input", renderPets);
}

function renderPets() {
  const search = document.getElementById("pet-search").value.toLowerCase();
  const list = document.getElementById("pet-list");

  // Keep pets whose name, species or area contains the search text
  const shown = pets.filter(function (p) {
    const text = (p.name + " " + p.species + " " + p.area).toLowerCase();
    return text.includes(search);
  });

  if (shown.length === 0) {
    list.innerHTML = '<p class="empty-msg">No pets found.</p>';
    return;
  }

  list.innerHTML = "";
  shown.forEach(function (p) {
    list.innerHTML += `
      <article class="card">
        ${petPhoto(p)}
        <h3>${p.name}</h3>
        <p><strong>${p.species}</strong> · ${p.breed} · ${p.age} yr</p>
        <p>👤 ${p.owner} · 📍 ${p.area}</p>
        <p>${p.notes}</p>
        <div class="card-actions">
          <a class="btn btn-small" href="requests.html?pet=${p.id}">Request help</a>
          <button class="btn btn-small btn-outline" onclick="deletePet(${p.id})">Remove</button>
        </div>
      </article>`;
  });
}

function deletePet(id) {
  if (!confirm("Remove this pet profile?")) return;
  pets = pets.filter(p => p.id !== id);           // keep every other pet
  requests = requests.filter(r => r.petId !== id); // and its requests
  saveAll();
  renderPets();
}


/* ---------- 6. VOLUNTEERS PAGE (profiles, report, block) ------------- */
function initVolunteers() {
  fillSelect("vol-area", AREAS);
  fillSelect("vol-filter-area", AREAS);

  // Build one checkbox per service
  const box = document.getElementById("vol-services");
  SERVICES.forEach(function (s) {
    box.innerHTML += `<label><input type="checkbox" name="services" value="${s}"> ${s}</label>`;
  });

  renderVolunteers();

  document.getElementById("vol-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // Collect the ticked checkboxes into an array
    const ticked = document.querySelectorAll('input[name="services"]:checked');
    const services = [];
    ticked.forEach(box => services.push(box.value));

    if (services.length === 0) {
      showMessage("vol-msg", "⚠️ Please choose at least one service.");
      return;
    }

    volunteers.push({
      id: nextId(volunteers),
      name: document.getElementById("vol-name").value.trim(),
      area: document.getElementById("vol-area").value,
      services: services,
      about: document.getElementById("vol-about").value.trim(),
      status: "pending",          // admin must verify before they appear
      blocked: false,
      ratings: [],
      reports: 0
    });

    saveAll();
    this.reset();
    showMessage("vol-msg", "✅ Thanks! Your profile is waiting for admin verification.");
  });

  document.getElementById("vol-filter-area").addEventListener("change", renderVolunteers);
  document.getElementById("vol-filter-service").addEventListener("change", renderVolunteers);
}

function renderVolunteers() {
  const area = document.getElementById("vol-filter-area").value;
  const service = document.getElementById("vol-filter-service").value;
  const list = document.getElementById("vol-list");

  // Only verified, un-blocked volunteers are shown to the public
  const shown = volunteers.filter(function (v) {
    const areaOk = area === "All" || v.area === area;
    const serviceOk = service === "All" || v.services.includes(service);
    return isAvailable(v) && areaOk && serviceOk;
  });

  if (shown.length === 0) {
    list.innerHTML = '<p class="empty-msg">No verified volunteers match these filters.</p>';
    return;
  }

  list.innerHTML = "";
  shown.forEach(function (v) {
    list.innerHTML += `
      <article class="card">
        <div class="avatar">${initials(v.name)}</div>
        <h3>${v.name} <span class="badge" data-status="verified">✔ Verified</span></h3>
        <p>📍 ${v.area}</p>
        <p>${starText(v)}</p>
        <p>${v.about}</p>
        <div>${v.services.map(s => '<span class="tag">' + s + "</span>").join("")}</div>
        <div class="card-actions">
          <button class="btn btn-small btn-outline" onclick="reportVolunteer(${v.id})">⚑ Report</button>
          <button class="btn btn-small btn-danger" onclick="blockVolunteer(${v.id})">⛔ Block</button>
        </div>
      </article>`;
  });
}

// Report = flag for the admin to review (counter goes up)
function reportVolunteer(id) {
  const reason = prompt("Why are you reporting this volunteer?");
  if (reason === null || reason.trim() === "") return;   // cancelled
  const v = findById(volunteers, id);
  v.reports = v.reports + 1;
  saveAll();
  alert("Thank you. The admin team will review this report.");
}

// Block = hide this volunteer from lists and matching
function blockVolunteer(id) {
  const v = findById(volunteers, id);
  if (!confirm("Block " + v.name + "? They will no longer be shown or matched.")) return;
  v.blocked = true;
  saveAll();
  renderVolunteers();
}


/* ---------- 7. REQUESTS PAGE -----------------------------------------
   Flow of a request:
     Open  ──(volunteer accepts)──►  Accepted  ──(done)──►  Completed
                                                       └─► owner rates 1–5 */
function initRequests() {
  fillSelect("req-type", SERVICES);
  fillSelect("req-filter-status", ["Open", "Accepted", "Completed"]);

  // Fill the "Which pet?" dropdown from the pets array
  const petSelect = document.getElementById("req-pet");
  pets.forEach(function (p) {
    petSelect.innerHTML += `<option value="${p.id}">${p.name} (${p.species}, ${p.area})</option>`;
  });

  // If we came from "Request help" on the Pets page (?pet=2), pre-select it
  const petFromLink = new URLSearchParams(location.search).get("pet");
  if (petFromLink) petSelect.value = petFromLink;

  // Scheduling: don't allow dates in the past
  document.getElementById("req-date").min = new Date().toISOString().split("T")[0];

  renderRequests();

  document.getElementById("req-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const pet = findById(pets, Number(petSelect.value));

    requests.push({
      id: nextId(requests),
      petId: pet.id,
      type: document.getElementById("req-type").value,
      area: pet.area,                   // request uses the pet's area
      date: document.getElementById("req-date").value,
      time: document.getElementById("req-time").value,
      notes: document.getElementById("req-notes").value.trim(),
      status: "Open",
      volunteerId: null,
      rating: null
    });

    saveAll();
    renderRequests();
    this.reset();
    showMessage("req-msg", "✅ Request posted! Matching volunteers are shown in the table.");
  });

  document.getElementById("req-filter-status").addEventListener("change", renderRequests);
}

// MATCHING: same area + offers the needed service + verified + not blocked
function findMatches(request) {
  return volunteers.filter(function (v) {
    return isAvailable(v) &&
           v.area === request.area &&
           v.services.includes(request.type);
  });
}

function renderRequests() {
  const filter = document.getElementById("req-filter-status").value;
  const body = document.getElementById("req-table-body");

  const shown = requests.filter(r => filter === "All" || r.status === filter);

  if (shown.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="empty-msg">No requests to show.</td></tr>';
    return;
  }

  body.innerHTML = "";
  shown.forEach(function (r) {
    const pet = findById(pets, r.petId);
    const petName = pet ? petThumb(pet) + pet.name : "Removed pet";

    body.innerHTML += `
      <tr>
        <td>${petName}</td>
        <td>${r.type}<br><small>${r.notes}</small></td>
        <td>${niceDate(r.date)}<br>${r.time}</td>
        <td>${r.area}</td>
        <td><span class="badge" data-status="${r.status}">${r.status}</span></td>
        <td>${actionCell(r)}</td>
      </tr>`;
  });
}

// Decides what to show in the "Action" column for each status
function actionCell(r) {
  if (r.status === "Open") {
    const matches = findMatches(r);
    if (matches.length === 0) {
      return "<small>No matching volunteer yet</small>";
    }
    let options = "";
    matches.forEach(v => {
      const avg = averageRating(v);
      const label = avg > 0 ? avg + "★" : "new";   // ternary operator
      options += `<option value="${v.id}">${v.name} (${label})</option>`;
    });
    return `<select id="pick-${r.id}">${options}</select>
            <button class="btn btn-small" onclick="acceptRequest(${r.id})">Accept</button>`;
  }

  const v = findById(volunteers, r.volunteerId);
  const vName = v ? v.name : "Unknown";

  if (r.status === "Accepted") {
    return `👤 ${vName}<br>
            <button class="btn btn-small btn-accent" onclick="completeRequest(${r.id})">Mark completed</button>`;
  }

  // Completed
  if (r.rating === null) {
    return `👤 ${vName}<br>
            <select id="rate-${r.id}">
              <option value="5">★★★★★ 5</option>
              <option value="4">★★★★ 4</option>
              <option value="3">★★★ 3</option>
              <option value="2">★★ 2</option>
              <option value="1">★ 1</option>
            </select>
            <button class="btn btn-small" onclick="rateRequest(${r.id})">Rate</button>`;
  }
  return `👤 ${vName}<br><span class="stars">${"★".repeat(r.rating)}</span> rated`;
}

// ACCEPTANCE: the chosen volunteer takes the request
function acceptRequest(id) {
  const r = findById(requests, id);
  r.volunteerId = Number(document.getElementById("pick-" + id).value);
  r.status = "Accepted";
  saveAll();
  renderRequests();
}

function completeRequest(id) {
  const r = findById(requests, id);
  r.status = "Completed";
  saveAll();
  renderRequests();
}

// RATING: save on the request AND add to the volunteer's ratings array
function rateRequest(id) {
  const r = findById(requests, id);
  const stars = Number(document.getElementById("rate-" + id).value);
  r.rating = stars;
  const v = findById(volunteers, r.volunteerId);
  if (v) v.ratings.push(stars);
  saveAll();
  renderRequests();
}


/* ---------- 8. ADMIN PAGE (verification) ----------------------------- */
function initAdmin() {
  renderAdmin();
}

function renderAdmin() {
  const body = document.getElementById("admin-table-body");
  body.innerHTML = "";

  volunteers.forEach(function (v) {
    // A blocked volunteer shows "blocked", otherwise their status
    const status = v.blocked ? "blocked" : v.status;

    // Choose which buttons to show
    let buttons = "";
    if (v.status !== "verified") {
      buttons += `<button class="btn btn-small" onclick="setStatus(${v.id}, 'verified')">Verify</button> `;
    }
    if (v.status !== "rejected") {
      buttons += `<button class="btn btn-small btn-danger" onclick="setStatus(${v.id}, 'rejected')">Reject</button> `;
    }
    if (v.blocked) {
      buttons += `<button class="btn btn-small btn-outline" onclick="unblock(${v.id})">Unblock</button>`;
    }

    body.innerHTML += `
      <tr>
        <td>${v.name}</td>
        <td>${v.area}</td>
        <td>${v.services.join(", ")}</td>
        <td><span class="badge" data-status="${status}">${status}</span></td>
        <td>${v.reports > 0 ? "⚑ " + v.reports : "0"}</td>
        <td>${buttons}</td>
      </tr>`;
  });

  // Summary numbers above the table
  document.getElementById("admin-pending").textContent =
    volunteers.filter(v => v.status === "pending").length;
  document.getElementById("admin-reported").textContent =
    volunteers.filter(v => v.reports > 0).length;
}

function setStatus(id, newStatus) {
  findById(volunteers, id).status = newStatus;
  saveAll();
  renderAdmin();
}

function unblock(id) {
  findById(volunteers, id).blocked = false;
  saveAll();
  renderAdmin();
}


/* ---------- 9. START-UP ----------------------------------------------
   Runs once the HTML has loaded. Reads <body data-page="..."> and
   calls the matching function.                                         */
document.addEventListener("DOMContentLoaded", function () {
  const page = document.body.dataset.page;

  if (page === "home")       initHome();
  if (page === "pets")       initPets();
  if (page === "volunteers") initVolunteers();
  if (page === "requests")   initRequests();
  if (page === "admin")      initAdmin();

  // Footer year updates automatically
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
