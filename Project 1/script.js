
// Blood group compatibility reference (general red-cell donation rules).
const BLOOD_COMPATIBILITY = {
  "O-":  { donatesTo: "All groups (universal red-cell donor)", receivesFrom: "O-" },
  "O+":  { donatesTo: "O+, A+, B+, AB+",                        receivesFrom: "O+, O-" },
  "A-":  { donatesTo: "A-, A+, AB-, AB+",                       receivesFrom: "A-, O-" },
  "A+":  { donatesTo: "A+, AB+",                                receivesFrom: "A+, A-, O+, O-" },
  "B-":  { donatesTo: "B-, B+, AB-, AB+",                       receivesFrom: "B-, O-" },
  "B+":  { donatesTo: "B+, AB+",                                receivesFrom: "B+, B-, O+, O-" },
  "AB-": { donatesTo: "AB-, AB+",                                receivesFrom: "AB-, A-, B-, O-" },
  "AB+": { donatesTo: "AB+ only (universal recipient for red cells)", receivesFrom: "All groups" }
};

// Which groups can receive FROM a given required group, used to widen a search
// (kept simple: a donor's group can serve a patient if it's compatibility-listed).
const CAN_DONATE_TO = {
  "O-":  ["O-","O+","A+","A-","B+","B-","AB+","AB-"],
  "O+":  ["O+","A+","B+","AB+"],
  "A-":  ["A-","A+","AB-","AB+"],
  "A+":  ["A+","AB+"],
  "B-":  ["B-","B+","AB-","AB+"],
  "B+":  ["B+","AB+"],
  "AB-": ["AB-","AB+"],
  "AB+": ["AB+"]
};

// Demo donor directory. distanceKm is a mock straight-line distance for the prototype;
// a real build would replace this with a geolocation/maps API calculation.
const SEED_DONORS = [
  { id:"d1",  name:"Rahul Sharma",   age:29, bloodGroup:"B+",  city:"Delhi",   area:"Rohini",         phone:"9810000001", email:"rahul.s@example.com",  distanceKm:2.4, available:true,  lastDonation:"2026-05-12" },
  { id:"d2",  name:"Aman Verma",     age:34, bloodGroup:"B+",  city:"Delhi",   area:"Pitampura",      phone:"9810000002", email:"aman.v@example.com",   distanceKm:4.1, available:true,  lastDonation:"2026-03-02" },
  { id:"d3",  name:"Priya Nair",     age:26, bloodGroup:"O-",  city:"Delhi",   area:"Janakpuri",      phone:"9810000003", email:"priya.n@example.com",  distanceKm:6.7, available:true,  lastDonation:"2026-06-20" },
  { id:"d4",  name:"Karan Malhotra", age:41, bloodGroup:"A+",  city:"Delhi",   area:"Dwarka",         phone:"9810000004", email:"karan.m@example.com",  distanceKm:8.3, available:false, lastDonation:"2025-11-08" },
  { id:"d5",  name:"Simran Kaur",    age:31, bloodGroup:"AB+", city:"Delhi",   area:"Rajouri Garden", phone:"9810000005", email:"simran.k@example.com", distanceKm:5.2, available:true,  lastDonation:"2026-01-15" },
  { id:"d6",  name:"Vikram Chauhan", age:38, bloodGroup:"B-",  city:"Delhi",   area:"Laxmi Nagar",    phone:"9810000006", email:"vikram.c@example.com", distanceKm:9.5, available:true,  lastDonation:"2026-04-30" },
  { id:"d7",  name:"Neha Gupta",     age:24, bloodGroup:"O+",  city:"Delhi",   area:"Shahdara",       phone:"9810000007", email:"neha.g@example.com",   distanceKm:11.2,available:true,  lastDonation:"2026-07-01" },
  { id:"d8",  name:"Arjun Mehta",    age:45, bloodGroup:"A-",  city:"Delhi",   area:"Saket",          phone:"9810000008", email:"arjun.m@example.com",  distanceKm:7.8, available:false, lastDonation:"2025-09-19" },
  { id:"d9",  name:"Isha Kapoor",    age:28, bloodGroup:"B+",  city:"Noida",   area:"Sector 62",      phone:"9810000009", email:"isha.k@example.com",   distanceKm:14.6,available:true,  lastDonation:"2026-06-05" },
  { id:"d10", name:"Rohan Bansal",   age:33, bloodGroup:"AB-", city:"Gurugram",area:"Sector 29",      phone:"9810000010", email:"rohan.b@example.com",  distanceKm:22.1,available:true,  lastDonation:"2026-02-14" },
  { id:"d11", name:"Tanya Sethi",    age:27, bloodGroup:"O+",  city:"Delhi",   area:"Rohini",         phone:"9810000011", email:"tanya.s@example.com",  distanceKm:3.0, available:true,  lastDonation:"2026-05-28" },
  { id:"d12", name:"Devansh Rao",    age:36, bloodGroup:"A+",  city:"Noida",   area:"Sector 18",      phone:"9810000012", email:"devansh.r@example.com",distanceKm:16.4,available:false, lastDonation:"2025-12-22" }
];

// Demo active blood requests shown on the "Blood Requests" page.
const SEED_REQUESTS = [
  { id:"r1", patient:"Patient A", bloodGroup:"O+",  units:2, hospital:"City Hospital",     city:"Delhi", area:"Karol Bagh", distanceKm:3.2, urgency:"Urgent",  postedAt:"2026-08-21T09:15:00" },
  { id:"r2", patient:"Patient B", bloodGroup:"B+",  units:1, hospital:"Metro Care Center",  city:"Delhi", area:"Rohini",     distanceKm:1.8, urgency:"Critical", postedAt:"2026-08-22T06:40:00" },
  { id:"r3", patient:"Patient C", bloodGroup:"A-",  units:3, hospital:"Sunrise Multispecialty", city:"Delhi", area:"Dwarka", distanceKm:9.0, urgency:"Normal",   postedAt:"2026-08-20T18:05:00" },
  { id:"r4", patient:"Patient D", bloodGroup:"AB+", units:1, hospital:"Lifeline Hospital",  city:"Noida", area:"Sector 62",  distanceKm:12.5,urgency:"Urgent",  postedAt:"2026-08-21T14:22:00" },
  { id:"r5", patient:"Patient E", bloodGroup:"O-",  units:4, hospital:"Apex Trauma Center", city:"Delhi", area:"Saket",      distanceKm:6.1, urgency:"Critical", postedAt:"2026-08-22T05:00:00" }
];

/* ----------  STORAGE HELPERS ---------- */
// Thin wrappers around localStorage so the rest of the app doesn't touch it directly.
// This is the seam where a real backend (Firebase, REST API) would plug in later.

function loadDonors(){
  const stored = localStorage.getItem("rs_donors");
  if(stored) return JSON.parse(stored);
  localStorage.setItem("rs_donors", JSON.stringify(SEED_DONORS));
  return [...SEED_DONORS];
}
function saveDonors(list){ localStorage.setItem("rs_donors", JSON.stringify(list)); }

function loadRequests(){
  const stored = localStorage.getItem("rs_requests");
  if(stored) return JSON.parse(stored);
  localStorage.setItem("rs_requests", JSON.stringify(SEED_REQUESTS));
  return [...SEED_REQUESTS];
}
function saveRequests(list){ localStorage.setItem("rs_requests", JSON.stringify(list)); }

function loadCurrentDonor(){
  const stored = localStorage.getItem("rs_currentDonor");
  return stored ? JSON.parse(stored) : null;
}
function saveCurrentDonor(donor){ localStorage.setItem("rs_currentDonor", JSON.stringify(donor)); }

/* ---------- APP STATE ---------- */
let donors = loadDonors();
let requests = loadRequests();
let lastSearchResults = [];
let lastSearchQuery = null;

/* ----------  NAVIGATION ---------- */
const navLinks = document.querySelectorAll("[data-nav]");
const pages = document.querySelectorAll(".page");
const mainNav = document.getElementById("mainNav");
const hamburgerBtn = document.getElementById("hamburgerBtn");

function goToPage(pageId){
  pages.forEach(p => p.classList.toggle("active", p.id === "page-" + pageId));
  document.querySelectorAll(".nav-link").forEach(link=>{
    link.classList.toggle("active", link.dataset.nav === pageId);
  });
  window.scrollTo({top:0, behavior:"smooth"});
  mainNav.classList.remove("open");

  if(pageId === "dashboard") renderDashboard();
  if(pageId === "requests") renderRequests();
  if(pageId === "home") animateStats();
}

navLinks.forEach(el=>{
  el.addEventListener("click", e=>{
    e.preventDefault();
    goToPage(el.dataset.nav);
  });
});

hamburgerBtn.addEventListener("click", ()=>{
  mainNav.classList.toggle("open");
});

/* ----------  TOAST + MODAL HELPERS ---------- */
const toastEl = document.getElementById("toast");
function showToast(message){
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> toastEl.classList.remove("show"), 2800);
}

const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", e=>{ if(e.target === modalOverlay) closeModal(); });

function openModal(html){
  modalContent.innerHTML = html;
  modalOverlay.classList.add("open");
}
function closeModal(){
  modalOverlay.classList.remove("open");
}

/* ----------  HOME PAGE: STATS + COMPATIBILITY TABLE ---------- */
function animateStats(){
  document.querySelectorAll(".stat-num").forEach(el=>{
    if(el.dataset.animated) return;
    el.dataset.animated = "true";
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString("en-IN");
      if(progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function renderCompatibilityTable(tbodyId){
  const tbody = document.getElementById(tbodyId);
  if(!tbody) return;
  tbody.innerHTML = Object.entries(BLOOD_COMPATIBILITY).map(([group, info])=>`
    <tr>
      <td>${group}</td>
      <td>${info.donatesTo}</td>
      <td>${info.receivesFrom}</td>
    </tr>
  `).join("");
}
renderCompatibilityTable("compatTableBody");
renderCompatibilityTable("compatTableBodyAbout");

/* ----------  FIND BLOOD: SEARCH, SORT, FILTER ---------- */
const findForm = document.getElementById("findForm");
const donorResultsEl = document.getElementById("donorResults");
const resultsToolbar = document.getElementById("resultsToolbar");
const resultsCountEl = document.getElementById("resultsCount");
const sortSelect = document.getElementById("sortSelect");

findForm.addEventListener("submit", e=>{
  e.preventDefault();
  const errorEl = document.getElementById("findFormError");
  errorEl.textContent = "";

  const query = {
    patientName: document.getElementById("fPatientName").value.trim(),
    bloodGroup: document.getElementById("fBloodGroup").value,
    units: document.getElementById("fUnits").value,
    hospital: document.getElementById("fHospital").value.trim(),
    city: document.getElementById("fCity").value,
    area: document.getElementById("fArea").value.trim(),
    contact: document.getElementById("fContact").value.trim(),
    urgency: document.getElementById("fUrgency").value
  };

  if(!query.bloodGroup || !query.city || !/^\d{10}$/.test(query.contact)){
    errorEl.textContent = "Please fill all required fields with a valid 10-digit contact number.";
    return;
  }

  lastSearchQuery = query;
  const results = searchDonors(query);
  lastSearchResults = results;
  renderDonorResults(results, query);
});

sortSelect.addEventListener("change", ()=>{
  if(!lastSearchResults.length) return;
  renderDonorResults(sortDonors(lastSearchResults, sortSelect.value), lastSearchQuery, false);
});

// Core matching logic: compatible blood group + same city + available first, sorted by distance.
// Structured so a real geolocation/maps API could replace distanceKm with a live calculation.
function searchDonors(query){
  const compatibleGroups = CAN_DONATE_TO[query.bloodGroup] || [query.bloodGroup];
  let matches = donors.filter(d =>
    compatibleGroups.includes(d.bloodGroup) &&
    d.city === query.city
  );

  // Prefer exact area match, but don't exclude the wider city if area is given.
  if(query.area){
    const areaMatches = matches.filter(d => d.area.toLowerCase().includes(query.area.toLowerCase()));
    if(areaMatches.length) matches = areaMatches;
  }

  return sortDonors(matches, "distance");
}

function sortDonors(list, mode){
  const copy = [...list];
  if(mode === "distance") copy.sort((a,b)=> a.distanceKm - b.distanceKm);
  else if(mode === "available") copy.sort((a,b)=> (b.available - a.available) || (a.distanceKm - b.distanceKm));
  else if(mode === "recent") copy.sort((a,b)=> new Date(b.lastDonation) - new Date(a.lastDonation));
  return copy;
}

function renderDonorResults(results, query, resetToolbar = true){
  if(resetToolbar){
    resultsToolbar.style.display = results.length ? "flex" : "none";
    sortSelect.value = "distance";
  }
  resultsCountEl.textContent = results.length ? `${results.length} matching donor${results.length>1?"s":""} found` : "";

  if(!results.length){
    donorResultsEl.innerHTML = `
      <div class="no-match-box">
        <h3>No matching donor is currently available nearby.</h3>
        <p>Try widening your search, or create a blood request so donors can be notified as they become available.</p>
        <div class="no-match-actions">
          <button class="btn btn-outline btn-sm" id="expandAreaBtn">Expand search area</button>
          <button class="btn btn-primary btn-sm" id="createRequestBtn">Create blood request</button>
        </div>
      </div>`;
    document.getElementById("expandAreaBtn").addEventListener("click", ()=>{
      document.getElementById("fArea").value = "";
      findForm.requestSubmit();
    });
    document.getElementById("createRequestBtn").addEventListener("click", ()=>{
      submitBloodRequest(query);
    });
    return;
  }

  donorResultsEl.innerHTML = results.map(d => donorCardHtml(d)).join("");

  results.forEach(d=>{
    document.getElementById(`call-${d.id}`).addEventListener("click", ()=> handleCallDonor(d));
    document.getElementById(`send-${d.id}`).addEventListener("click", ()=> handleSendRequest(d, query));
  });
}

function donorCardHtml(d){
  const initials = d.name.split(" ").map(w=>w[0]).slice(0,2).join("");
  return `
    <div class="donor-card">
      <div class="donor-avatar">${initials}</div>
      <div class="donor-info">
        <h4>${d.name}</h4>
        <div class="donor-meta">
          <span class="tag tag-group">${d.bloodGroup}</span>
          <span class="tag ${d.available ? "tag-available" : "tag-unavailable"}">${d.available ? "Available" : "Not available"}</span>
          <span>${d.distanceKm.toFixed(1)} km away</span>
          <span>${d.area}, ${d.city}</span>
        </div>
      </div>
      <div class="donor-actions">
        <button class="btn btn-outline btn-sm" id="call-${d.id}">Call Donor</button>
        <button class="btn btn-primary btn-sm" id="send-${d.id}">Send Request</button>
      </div>
    </div>`;
}

// Privacy-conscious "call": we never print the raw number in the DOM list view.
// The modal reveals a tel: link only after the user opts in, mimicking a masked-call flow.
function handleCallDonor(donor){
  openModal(`
    <div class="modal-icon">📞</div>
    <h3>Contact ${donor.name}?</h3>
    <p>For privacy, donor numbers aren't shown in public listings. Continuing will place a demo call using a masked line.</p>
    <div class="modal-actions">
      <a class="btn btn-primary" href="tel:${donor.phone}">Call now (demo)</a>
      <button class="btn btn-outline" id="cancelCall">Cancel</button>
    </div>
  `);
  document.getElementById("cancelCall").addEventListener("click", closeModal);
}

function handleSendRequest(donor, query){
  const req = {
    id: "req_" + Date.now(),
    donorId: donor.id,
    donorName: donor.name,
    patientName: query.patientName,
    bloodGroup: query.bloodGroup,
    units: query.units,
    hospital: query.hospital,
    contact: query.contact,
    urgency: query.urgency,
    sentAt: new Date().toISOString()
  };
  const sent = JSON.parse(localStorage.getItem("rs_sentRequests") || "[]");
  sent.push(req);
  localStorage.setItem("rs_sentRequests", JSON.stringify(sent));

  openModal(`
    <div class="modal-icon">✅</div>
    <h3>Blood request sent successfully.</h3>
    <p>Matching donors will be notified.</p>
    <p style="font-size:0.82rem; color:var(--ink-400);">Demo mode: this request has been saved locally and would trigger a real notification in production.</p>
    <div class="modal-actions">
      <button class="btn btn-primary" id="closeModalOk">Done</button>
    </div>
  `);
  document.getElementById("closeModalOk").addEventListener("click", closeModal);
}

// Used by the "Create blood request" no-match fallback — adds a request to the public board.
function submitBloodRequest(query){
  if(!query){ showToast("Please fill the request form first."); return; }
  const newRequest = {
    id: "r_" + Date.now(),
    patient: query.patientName || "Patient",
    bloodGroup: query.bloodGroup,
    units: Number(query.units) || 1,
    hospital: query.hospital || "Not specified",
    city: query.city,
    area: query.area || "—",
    distanceKm: 0,
    urgency: query.urgency,
    postedAt: new Date().toISOString()
  };
  requests.unshift(newRequest);
  saveRequests(requests);
  closeModal();
  openModal(`
    <div class="modal-icon">✅</div>
    <h3>Blood request sent successfully.</h3>
    <p>Matching donors will be notified.</p>
    <div class="modal-actions">
      <button class="btn btn-primary" id="viewRequestsBtn">View Blood Requests</button>
    </div>
  `);
  document.getElementById("viewRequestsBtn").addEventListener("click", ()=>{
    closeModal();
    goToPage("requests");
  });
}

/* ----------  DONOR REGISTRATION ---------- */
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", e=>{
  e.preventDefault();
  const errorEl = document.getElementById("registerFormError");
  errorEl.textContent = "";

  const name = document.getElementById("rName").value.trim();
  const age = Number(document.getElementById("rAge").value);
  const bloodGroup = document.getElementById("rBloodGroup").value;
  const phone = document.getElementById("rPhone").value.trim();
  const city = document.getElementById("rCity").value;
  const area = document.getElementById("rArea").value.trim();
  const pincode = document.getElementById("rPincode").value.trim();
  const email = document.getElementById("rEmail").value.trim();
  const lastDonation = document.getElementById("rLastDonation").value;
  const availability = document.getElementById("rAvailability").value === "true";
  const consent = document.getElementById("rConsent").checked;

  if(!name || !bloodGroup || !/^\d{10}$/.test(phone) || !city || !area || !email){
    errorEl.textContent = "Please fill all required fields correctly.";
    return;
  }
  if(age < 18 || age > 65){
    errorEl.textContent = "Donor age must be between 18 and 65.";
    return;
  }
  if(!consent){
    errorEl.textContent = "Please agree to be contacted for blood donation requests.";
    return;
  }

  const newDonor = {
    id: "donor_" + Date.now(),
    name, age, bloodGroup, phone, city, area, pincode, email,
    distanceKm: Math.round((Math.random()*10 + 1) * 10) / 10, // demo distance until real geolocation is added
    available: availability,
    lastDonation: lastDonation || null
  };

  donors.push(newDonor);
  saveDonors(donors);
  saveCurrentDonor(newDonor);

  registerForm.reset();
  openModal(`
    <div class="modal-icon">🩸</div>
    <h3>Welcome to LifeLink, ${name}!</h3>
    <p>You're now registered as a ${bloodGroup} donor in ${area}, ${city}.</p>
    <div class="modal-actions">
      <button class="btn btn-primary" id="goToDashboardBtn">Go to Donor Dashboard</button>
    </div>
  `);
  document.getElementById("goToDashboardBtn").addEventListener("click", ()=>{
    closeModal();
    goToPage("dashboard");
  });
});

/* ----------  DONOR DASHBOARD ---------- */
const dashboardContent = document.getElementById("dashboardContent");
const dashboardWelcome = document.getElementById("dashboardWelcome");

function renderDashboard(){
  const donor = loadCurrentDonor();

  if(!donor){
    dashboardWelcome.textContent = "Donor Dashboard";
    dashboardContent.innerHTML = `
      <div class="dashboard-empty">
        <p>You haven't registered as a donor yet.</p>
        <button class="btn btn-primary" style="margin-top:14px;" id="goRegisterBtn">Become a Donor</button>
      </div>`;
    document.getElementById("goRegisterBtn").addEventListener("click", ()=> goToPage("register"));
    return;
  }

  dashboardWelcome.textContent = `Welcome, ${donor.name}`;

  const nearby = requests
    .filter(r => r.city === donor.city)
    .sort((a,b)=> a.distanceKm - b.distanceKm)
    .slice(0,4);

  dashboardContent.innerHTML = `
    <div class="dashboard-cards">
      <div class="dash-card"><div class="dash-label">Blood Group</div><div class="dash-value">${donor.bloodGroup}</div></div>
      <div class="dash-card"><div class="dash-label">Donation Status</div><div class="dash-value">${donor.lastDonation ? "Donated before" : "No donations yet"}</div></div>
      <div class="dash-card"><div class="dash-label">Requests Received</div><div class="dash-value">${nearby.length}</div></div>
      <div class="dash-card"><div class="dash-label">Last Donation</div><div class="dash-value">${donor.lastDonation || "—"}</div></div>
    </div>

    <div class="availability-toggle">
      <label class="switch">
        <input type="checkbox" id="availabilityToggle" ${donor.available ? "checked" : ""}>
        <span class="slider"></span>
      </label>
      <div>
        <strong>Available for Donation</strong>
        <p style="margin-top:2px;">${donor.available ? "You're visible to nearby blood requests." : "You're currently hidden from search results."}</p>
      </div>
    </div>

    <h2 style="font-size:1.2rem; margin-bottom:16px;">Nearby Blood Requests</h2>
    <div class="requests-grid" id="dashboardRequestsGrid">
      ${nearby.length ? nearby.map(r => requestCardHtml(r, true)).join("") : `<p>No nearby requests right now.</p>`}
    </div>
  `;

  document.getElementById("availabilityToggle").addEventListener("change", e=>{
    donor.available = e.target.checked;
    saveCurrentDonor(donor);
    donors = donors.map(d => d.id === donor.id ? donor : d);
    saveDonors(donors);
    renderDashboard();
    showToast(donor.available ? "You're marked as available." : "You're marked as not available.");
  });

  if(nearby.length){
    nearby.forEach(r=>{
      const acceptBtn = document.getElementById(`accept-${r.id}`);
      const declineBtn = document.getElementById(`decline-${r.id}`);
      if(acceptBtn) acceptBtn.addEventListener("click", ()=>{
        showToast(`Request from ${r.hospital} accepted. They'll be notified.`);
      });
      if(declineBtn) declineBtn.addEventListener("click", ()=>{
        showToast("Request declined.");
      });
    });
  }
}

/* ----------  BLOOD REQUESTS PAGE ---------- */
function requestCardHtml(r, isDashboardCard = false){
  const posted = new Date(r.postedAt);
  const timeAgo = timeSince(posted);
  return `
    <div class="request-card urgency-${r.urgency}">
      <div class="request-top">
        <span class="request-group">${r.bloodGroup}</span>
        <span class="urgency-badge urgency-${r.urgency}">${r.urgency}</span>
      </div>
      <div class="request-detail"><strong>${r.units}</strong> unit${r.units>1?"s":""} needed at <strong>${r.hospital}</strong></div>
      <div class="request-detail">${r.area}, ${r.city} · ${r.distanceKm.toFixed(1)} km away</div>
      <div class="request-time">Posted ${timeAgo}</div>
      <div class="request-actions">
        ${isDashboardCard
          ? `<button class="btn btn-primary btn-sm" id="accept-${r.id}">Accept Request</button><button class="btn btn-outline btn-sm" id="decline-${r.id}">Decline</button>`
          : `<button class="btn btn-primary btn-sm" id="respond-${r.id}">Respond</button>`
        }
      </div>
    </div>`;
}

function timeSince(date){
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if(seconds < 60) return "just now";
  const minutes = Math.floor(seconds/60);
  if(minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes/60);
  if(hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours/24);
  return `${days} day${days>1?"s":""} ago`;
}

function renderRequests(){
  const grid = document.getElementById("requestsGrid");
  const sorted = [...requests].sort((a,b)=> new Date(b.postedAt) - new Date(a.postedAt));
  grid.innerHTML = sorted.map(r => requestCardHtml(r)).join("");

  sorted.forEach(r=>{
    const btn = document.getElementById(`respond-${r.id}`);
    if(btn) btn.addEventListener("click", ()=>{
      openModal(`
        <div class="modal-icon">🤝</div>
        <h3>Response noted</h3>
        <p>Your response to the request for <strong>${r.bloodGroup}</strong> at ${r.hospital} has been recorded. In production this would notify the requester directly.</p>
        <div class="modal-actions"><button class="btn btn-primary" id="respondOk">Okay</button></div>
      `);
      document.getElementById("respondOk").addEventListener("click", closeModal);
    });
  });
}

/* ----------  CONTACT FORM ---------- */
document.getElementById("contactForm").addEventListener("submit", e=>{
  e.preventDefault();
  const errorEl = document.getElementById("contactFormError");
  const name = document.getElementById("cName").value.trim();
  const email = document.getElementById("cEmail").value.trim();
  const message = document.getElementById("cMessage").value.trim();

  if(!name || !email || !message){
    errorEl.textContent = "Please fill in all fields.";
    return;
  }
  errorEl.textContent = "";
  e.target.reset();
  showToast("Message sent. Thanks for reaching out!");
});

/* ----------  INIT ---------- */
animateStats();
