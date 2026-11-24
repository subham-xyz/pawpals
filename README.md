# 🐾 PawPals – Local Pet Assistance Network

A verified community network that connects pet owners with trusted local volunteers for **non-medical** pet help: walking, fostering, pet sitting and transport.

**CSE326 Internet Programming project by Team Pixel Pioneers (Section K3P26YG)**

| Name | Registration No. |
|---|---|
| Prince Saini | 12625059 |
| Subham Mahapatra | 12620150 |
| Bhumi | 12629711 |

---

## Problem
Pet owners sometimes need temporary help, such as a walk, a foster home or a ride, but lack trusted local connections.

## Solution
PawPals is a website where owners create pet profiles and post assistance requests. Verified volunteers in the same area are matched to each request. Volunteers can be rated, reported or blocked, and an admin verifies every new volunteer.

## Features
- **Pet profiles:** add, search and remove pets
- **Assistance requests:** post the type of help needed
- **Scheduling:** date and time on every request
- **Volunteer profiles:** services, area and average rating
- **Matching:** same area, offers the service, verified and not blocked
- **Acceptance:** a volunteer accepts the request
- **Ratings:** 1–5 stars after the job is completed
- **Report / block:** flag or hide a volunteer
- **Admin verification:** new volunteers stay hidden until approved

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home: hero, live stats, services, how it works, FAQ |
| `pets.html` | Pet profiles |
| `requests.html` | Requests, scheduling, matching, acceptance, ratings |
| `volunteers.html` | Volunteer sign-up, filters, report and block |
| `admin.html` | Admin verification and demo-data reset |
| `style.css` | All styling (colours are set in section 1) |
| `script.js` | All behaviour (demo data is in section 1) |
| `*.jpg` | Pet photos |
| `` | Explainer video and presentation |

## Built with
Plain **HTML, CSS and JavaScript**, with no frameworks and no server.
- **HTML (Units I–II):** semantic tags, forms with validation, tables, details/summary
- **CSS (Unit III):** variables, Flexbox, Grid, pseudo-classes and pseudo-elements, transitions, animations, media queries
- **JavaScript (Unit IV):** arrays of objects, functions, conditionals, array methods, events

Data is saved in the browser with `localStorage`. Use **Admin → Reset demo data** to start over.
