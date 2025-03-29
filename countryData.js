mapboxgl.accessToken = 'pk.eyJ1IjoibGVvcG9sZG9yZXplbmRlIiwiYSI6ImNqOG9zaXVyazA3anozNG8weTVrcnl4NDgifQ._89Jf3MABokdSiU0fqX84w';

const countryDataBase = {
    "United States of America": { 
        name: "Estados Unidos", 
        population: { value: 331900000, unit: "pessoas" }, 
        gdp: { value: 23000, unit: "bilhões USD" }, 
        treasury: { value: 2500, unit: "bilhões USD" }, 
        researchDevelopment: { value: 9, unit: "escala 0-10" }, 
        happiness: { value: 7.2, unit: "escala 0-10" }, 
        military: { navy: 95, airforce: 90, army: 85, space: 80 }, 
        economicAlliances: [], 
        militaryAlliances: [],
        borders: [
            { country: "Canada", type: "land", enabled: true },
            { country: "Mexico", type: "land", enabled: true },
            { country: "Russia", type: "sea", enabled: true },
            { country: "Cuba", type: "sea", enabled: true }
        ]
    },
    "China": { 
        name: "China", 
        population: { value: 1412000000, unit: "pessoas" }, 
        gdp: { value: 17700, unit: "bilhões USD" }, 
        treasury: { value: 3200, unit: "bilhões USD" }, 
        researchDevelopment: { value: 8, unit: "escala 0-10" }, 
        happiness: { value: 5.9, unit: "escala 0-10" }, 
        military: { navy: 70, airforce: 75, army: 90, space: 60 }, 
        economicAlliances: [], 
        militaryAlliances: [],
        borders: [
            { country: "Afghanistan", type: "land", enabled: true },
            { country: "Bhutan", type: "land", enabled: false },
            { country: "India", type: "land", enabled: true },
            { country: "Kazakhstan", type: "land", enabled: false },
            { country: "North Korea", type: "land", enabled: true },
            { country: "Kyrgyzstan", type: "land", enabled: false },
            { country: "Laos", type: "land", enabled: false },
            { country: "Mongolia", type: "land", enabled: false },
            { country: "Myanmar", type: "land", enabled: false },
            { country: "Nepal", type: "land", enabled: false },
            { country: "Pakistan", type: "land", enabled: true },
            { country: "Russia", type: "land", enabled: true },
            { country: "Tajikistan", type: "land", enabled: false },
            { country: "Vietnam", type: "land", enabled: false },
            { country: "Japan", type: "sea", enabled: true },
            { country: "Philippines", type: "sea", enabled: false },
            { country: "South Korea", type: "sea", enabled: true },
            { country: "Taiwan", type: "sea", enabled: false },
            { country: "Malaysia", type: "sea", enabled: false }
        ]
    },
    "Japan": { 
        name: "Japão", 
        population: { value: 125800000, unit: "pessoas" }, 
        gdp: { value: 5000, unit: "bilhões USD" }, 
        treasury: { value: 1100, unit: "bilhões USD" }, 
        researchDevelopment: { value: 9, unit: "escala 0-10" }, 
        happiness: { value: 6.5, unit: "escala 0-10" }, 
        military: { navy: 55, airforce: 50, army: 45, space: 20 }, 
        economicAlliances: [], 
        militaryAlliances: [],
        borders: [
            { country: "Russia", type: "sea", enabled: true },
            { country: "China", type: "sea", enabled: true },
            { country: "South Korea", type: "sea", enabled: true },
            { country: "North Korea", type: "sea", enabled: true },
            { country: "Taiwan", type: "sea", enabled: false },
            { country: "Philippines", type: "sea", enabled: false }
        ]
    },
    "Brazil": { 
        name: "Brasil", 
        population: { value: 214300000, unit: "pessoas" }, 
        gdp: { value: 1800, unit: "bilhões USD" }, 
        treasury: { value: 350, unit: "bilhões USD" }, 
        researchDevelopment: { value: 5, unit: "escala 0-10" }, 
        happiness: { value: 6.8, unit: "escala 0-10" }, 
        military: { navy: 45, airforce: 50, army: 70, space: 10 }, 
        economicAlliances: [], 
        militaryAlliances: [],
        borders: [
            { country: "Argentina", type: "land", enabled: true },
            { country: "Bolivia", type: "land", enabled: false },
            { country: "Colombia", type: "land", enabled: false },
            { country: "French Guiana", type: "land", enabled: false },
            { country: "Guyana", type: "land", enabled: false },
            { country: "Paraguay", type: "land", enabled: false },
            { country: "Peru", type: "land", enabled: false },
            { country: "Suriname", type: "land", enabled: false },
            { country: "Uruguay", type: "land", enabled: false },
            { country: "Venezuela", type: "land", enabled: false },
            { country: "Angola", type: "sea", enabled: true },
            { country: "Nigeria", type: "sea", enabled: true }
        ]
    },
    "Russia": { 
        name: "Rússia", 
        population: { value: 145900000, unit: "pessoas" }, 
        gdp: { value: 1700, unit: "bilhões USD" }, 
        treasury: { value: 600, unit: "bilhões USD" }, 
        researchDevelopment: { value: 7, unit: "escala 0-10" }, 
        happiness: { value: 5.5, unit: "escala 0-10" }, 
        military: { navy: 70, airforce: 75, army: 85, space: 50 }, 
        economicAlliances: [], 
        militaryAlliances: [],
        borders: [
            { country: "Azerbaijan", type: "land", enabled: false },
            { country: "Belarus", type: "land", enabled: true },
            { country: "China", type: "land", enabled: true },
            { country: "Estonia", type: "land", enabled: false },
            { country: "Finland", type: "land", enabled: false },
            { country: "Georgia", type: "land", enabled: false },
            { country: "Kazakhstan", type: "land", enabled: false },
            { country: "North Korea", type: "land", enabled: true },
            { country: "Latvia", type: "land", enabled: false },
            { country: "Lithuania", type: "land", enabled: false },
            { country: "Mongolia", type: "land", enabled: false },
            { country: "Norway", type: "land", enabled: false },
            { country: "Poland", type: "land", enabled: true },
            { country: "Ukraine", type: "land", enabled: true },
            { country: "United States of America", type: "sea", enabled: true },
            { country: "Japan", type: "sea", enabled: true },
            { country: "Canada", type: "sea", enabled: true }
        ]
    },
    "India": { 
        name: "Índia", 
        population: { value: 1393000000, unit: "pessoas" }, 
        gdp: { value: 3200, unit: "bilhões USD" }, 
        treasury: { value: 500, unit: "bilhões USD" }, 
        researchDevelopment: { value: 5, unit: "escala 0-10" }, 
        happiness: { value: 4.5, unit: "escala 0-10" }, 
        military: { navy: 60, airforce: 65, army: 80, space: 25 }, 
        economicAlliances: [], 
        militaryAlliances: [],
        borders: [
            { country: "Bangladesh", type: "land", enabled: false },
            { country: "Bhutan", type: "land", enabled: false },
            { country: "China", type: "land", enabled: true },
            { country: "Myanmar", type: "land", enabled: false },
            { country: "Nepal", type: "land", enabled: false },
            { country: "Pakistan", type: "land", enabled: true },
            { country: "Sri Lanka", type: "sea", enabled: false },
            { country: "Maldives", type: "sea", enabled: false },
            { country: "Indonesia", type: "sea", enabled: true },
            { country: "Thailand", type: "sea", enabled: true }
        ]
    },
  "Germany": { 
    name: "Alemanha", 
    population: { value: 83200000, unit: "pessoas" }, 
    gdp: { value: 4300, unit: "bilhões USD" }, 
    treasury: { value: 600, unit: "bilhões USD" }, 
    researchDevelopment: { value: 9, unit: "escala 0-10" }, 
    happiness: { value: 7.1, unit: "escala 0-10" }, 
    military: { navy: 40, airforce: 50, army: 55, space: 15 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Austria", type: "land", enabled: false },
        { country: "Belgium", type: "land", enabled: false },
        { country: "Czech Republic", type: "land", enabled: false },
        { country: "Denmark", type: "land", enabled: false },
        { country: "France", type: "land", enabled: true },
        { country: "Luxembourg", type: "land", enabled: false },
        { country: "Netherlands", type: "land", enabled: false },
        { country: "Poland", type: "land", enabled: true },
        { country: "Switzerland", type: "land", enabled: true },
        { country: "Sweden", type: "sea", enabled: true },
        { country: "Norway", type: "sea", enabled: false }
    ]
},
"United Kingdom": { 
    name: "Reino Unido", 
    population: { value: 67900000, unit: "pessoas" }, 
    gdp: { value: 3100, unit: "bilhões USD" }, 
    treasury: { value: 450, unit: "bilhões USD" }, 
    researchDevelopment: { value: 8, unit: "escala 0-10" }, 
    happiness: { value: 7.3, unit: "escala 0-10" }, 
    military: { navy: 65, airforce: 60, army: 50, space: 20 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Ireland", type: "land", enabled: false }, // Fronteira terrestre com a Irlanda do Norte
        { country: "France", type: "sea", enabled: true },
        { country: "Belgium", type: "sea", enabled: false },
        { country: "Netherlands", type: "sea", enabled: false },
        { country: "Norway", type: "sea", enabled: false },
        { country: "Iceland", type: "sea", enabled: false }
    ]
},
"France": { 
    name: "França", 
    population: { value: 67400000, unit: "pessoas" }, 
    gdp: { value: 2900, unit: "bilhões USD" }, 
    treasury: { value: 400, unit: "bilhões USD" }, 
    researchDevelopment: { value: 8, unit: "escala 0-10" }, 
    happiness: { value: 7.0, unit: "escala 0-10" }, 
    military: { navy: 60, airforce: 65, army: 55, space: 30 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Andorra", type: "land", enabled: false },
        { country: "Belgium", type: "land", enabled: false },
        { country: "Germany", type: "land", enabled: true },
        { country: "Italy", type: "land", enabled: true },
        { country: "Luxembourg", type: "land", enabled: false },
        { country: "Monaco", type: "land", enabled: false },
        { country: "Spain", type: "land", enabled: true },
        { country: "Switzerland", type: "land", enabled: true },
        { country: "United Kingdom", type: "sea", enabled: true },
        { country: "Brazil", type: "sea", enabled: true } // Fronteira marítima via Guiana Francesa
    ]
},
"Canada": { 
    name: "Canadá", 
    population: { value: 38000000, unit: "pessoas" }, 
    gdp: { value: 2000, unit: "bilhões USD" }, 
    treasury: { value: 400, unit: "bilhões USD" }, 
    researchDevelopment: { value: 8, unit: "escala 0-10" }, 
    happiness: { value: 7.6, unit: "escala 0-10" }, 
    military: { navy: 40, airforce: 45, army: 35, space: 10 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "United States of America", type: "land", enabled: true },
        { country: "Greenland", type: "sea", enabled: true },
        { country: "Russia", type: "sea", enabled: true },
        { country: "France", type: "sea", enabled: true } // Via Saint-Pierre e Miquelon
    ]
},
"South Korea": { 
    name: "Coreia do Sul", 
    population: { value: 51700000, unit: "pessoas" }, 
    gdp: { value: 1800, unit: "bilhões USD" }, 
    treasury: { value: 500, unit: "bilhões USD" }, 
    researchDevelopment: { value: 9, unit: "escala 0-10" }, 
    happiness: { value: 6.0, unit: "escala 0-10" }, 
    military: { navy: 50, airforce: 55, army: 60, space: 15 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "North Korea", type: "land", enabled: true },
        { country: "China", type: "sea", enabled: true },
        { country: "Japan", type: "sea", enabled: true },
        { country: "Russia", type: "sea", enabled: true }
    ]
},
"Italy": { 
    name: "Itália", 
    population: { value: 59600000, unit: "pessoas" }, 
    gdp: { value: 2100, unit: "bilhões USD" }, 
    treasury: { value: 300, unit: "bilhões USD" }, 
    researchDevelopment: { value: 7, unit: "escala 0-10" }, 
    happiness: { value: 6.7, unit: "escala 0-10" }, 
    military: { navy: 50, airforce: 45, army: 40, space: 10 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Austria", type: "land", enabled: false },
        { country: "France", type: "land", enabled: true },
        { country: "San Marino", type: "land", enabled: false },
        { country: "Slovenia", type: "land", enabled: false },
        { country: "Switzerland", type: "land", enabled: true },
        { country: "Vatican City", type: "land", enabled: false },
        { country: "Albania", type: "sea", enabled: false },
        { country: "Croatia", type: "sea", enabled: false },
        { country: "Greece", type: "sea", enabled: false },
        { country: "Libya", type: "sea", enabled: false },
        { country: "Malta", type: "sea", enabled: false },
        { country: "Montenegro", type: "sea", enabled: false },
        { country: "Tunisia", type: "sea", enabled: false }
    ]
},
"Australia": { 
    name: "Austrália", 
    population: { value: 26000000, unit: "pessoas" }, 
    gdp: { value: 1600, unit: "bilhões USD" }, 
    treasury: { value: 300, unit: "bilhões USD" }, 
    researchDevelopment: { value: 8, unit: "escala 0-10" }, 
    happiness: { value: 7.5, unit: "escala 0-10" }, 
    military: { navy: 50, airforce: 45, army: 40, space: 15 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Indonesia", type: "sea", enabled: true },
        { country: "Papua New Guinea", type: "sea", enabled: false },
        { country: "New Zealand", type: "sea", enabled: false },
        { country: "Timor-Leste", type: "sea", enabled: false },
        { country: "Solomon Islands", type: "sea", enabled: false },
        { country: "New Caledonia", type: "sea", enabled: false }
    ]
},
"Spain": { 
    name: "Espanha", 
    population: { value: 47400000, unit: "pessoas" }, 
    gdp: { value: 1400, unit: "bilhões USD" }, 
    treasury: { value: 250, unit: "bilhões USD" }, 
    researchDevelopment: { value: 6, unit: "escala 0-10" }, 
    happiness: { value: 6.9, unit: "escala 0-10" }, 
    military: { navy: 45, airforce: 40, army: 35, space: 5 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Andorra", type: "land", enabled: false },
        { country: "France", type: "land", enabled: true },
        { country: "Gibraltar", type: "land", enabled: false }, // Território britânico
        { country: "Portugal", type: "land", enabled: false },
        { country: "Morocco", type: "sea", enabled: false }, // Via Ceuta e Melilla
        { country: "Algeria", type: "sea", enabled: false },
        { country: "Italy", type: "sea", enabled: true }
    ]
},
"Mexico": { 
    name: "México", 
    population: { value: 128900000, unit: "pessoas" }, 
    gdp: { value: 1300, unit: "bilhões USD" }, 
    treasury: { value: 200, unit: "bilhões USD" }, 
    researchDevelopment: { value: 5, unit: "escala 0-10" }, 
    happiness: { value: 6.5, unit: "escala 0-10" }, 
    military: { navy: 40, airforce: 35, army: 50, space: 5 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Belize", type: "land", enabled: false },
        { country: "Guatemala", type: "land", enabled: false },
        { country: "United States of America", type: "land", enabled: true },
        { country: "Cuba", type: "sea", enabled: true },
        { country: "Honduras", type: "sea", enabled: false }
    ]
},
"Indonesia": { 
    name: "Indonésia", 
    population: { value: 273500000, unit: "pessoas" }, 
    gdp: { value: 1200, unit: "bilhões USD" }, 
    treasury: { value: 180, unit: "bilhões USD" }, 
    researchDevelopment: { value: 5, unit: "escala 0-10" }, 
    happiness: { value: 5.8, unit: "escala 0-10" }, 
    military: { navy: 50, airforce: 40, army: 60, space: 5 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Malaysia", type: "land", enabled: false }, // Na ilha de Borneo
        { country: "Papua New Guinea", type: "land", enabled: false },
        { country: "Timor-Leste", type: "land", enabled: false },
        { country: "Australia", type: "sea", enabled: true },
        { country: "India", type: "sea", enabled: true },
        { country: "Philippines", type: "sea", enabled: false },
        { country: "Singapore", type: "sea", enabled: false },
        { country: "Thailand", type: "sea", enabled: true },
        { country: "Vietnam", type: "sea", enabled: false }
    ]
},
"Saudi Arabia": { 
    name: "Arábia Saudita", 
    population: { value: 35000000, unit: "pessoas" }, 
    gdp: { value: 830, unit: "bilhões USD" }, 
    treasury: { value: 900, unit: "bilhões USD" }, 
    researchDevelopment: { value: 5, unit: "escala 0-10" }, 
    happiness: { value: 6.2, unit: "escala 0-10" }, 
    military: { navy: 40, airforce: 50, army: 55, space: 10 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Iraq", type: "land", enabled: false },
        { country: "Jordan", type: "land", enabled: false },
        { country: "Kuwait", type: "land", enabled: false },
        { country: "Oman", type: "land", enabled: false },
        { country: "Qatar", type: "land", enabled: false },
        { country: "United Arab Emirates", type: "land", enabled: true },
        { country: "Yemen", type: "land", enabled: false },
        { country: "Egypt", type: "sea", enabled: true },
        { country: "Iran", type: "sea", enabled: true },
        { country: "Sudan", type: "sea", enabled: false }
    ]
},
"Turkey": { 
    name: "Turquia", 
    population: { value: 84300000, unit: "pessoas" }, 
    gdp: { value: 820, unit: "bilhões USD" }, 
    treasury: { value: 150, unit: "bilhões USD" }, 
    researchDevelopment: { value: 5, unit: "escala 0-10" }, 
    happiness: { value: 5.4, unit: "escala 0-10" }, 
    military: { navy: 50, airforce: 55, army: 70, space: 10 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Armenia", type: "land", enabled: false },
        { country: "Azerbaijan", type: "land", enabled: false },
        { country: "Bulgaria", type: "land", enabled: false },
        { country: "Georgia", type: "land", enabled: false },
        { country: "Greece", type: "land", enabled: false },
        { country: "Iran", type: "land", enabled: true },
        { country: "Iraq", type: "land", enabled: false },
        { country: "Syria", type: "land", enabled: false },
        { country: "Russia", type: "sea", enabled: true },
        { country: "Ukraine", type: "sea", enabled: true },
        { country: "Egypt", type: "sea", enabled: true }
    ]
},
"South Africa": { 
    name: "África do Sul", 
    population: { value: 59300000, unit: "pessoas" }, 
    gdp: { value: 420, unit: "bilhões USD" }, 
    treasury: { value: 100, unit: "bilhões USD" }, 
    researchDevelopment: { value: 5, unit: "escala 0-10" }, 
    happiness: { value: 5.0, unit: "escala 0-10" }, 
    military: { navy: 35, airforce: 30, army: 40, space: 5 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Botswana", type: "land", enabled: false },
        { country: "Eswatini", type: "land", enabled: false },
        { country: "Lesotho", type: "land", enabled: false },
        { country: "Mozambique", type: "land", enabled: false },
        { country: "Namibia", type: "land", enabled: false },
        { country: "Zimbabwe", type: "land", enabled: false },
        { country: "Argentina", type: "sea", enabled: true }, // Via Atlântico
        { country: "Australia", type: "sea", enabled: true }, // Via Índico
        { country: "Madagascar", type: "sea", enabled: false }
    ]
},
"Argentina": { 
    name: "Argentina", 
    population: { value: 45400000, unit: "pessoas" }, 
    gdp: { value: 490, unit: "bilhões USD" }, 
    treasury: { value: 80, unit: "bilhões USD" }, 
    researchDevelopment: { value: 5, unit: "escala 0-10" }, 
    happiness: { value: 6.3, unit: "escala 0-10" }, 
    military: { navy: 30, airforce: 25, army: 35, space: 5 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Bolivia", type: "land", enabled: false },
        { country: "Brazil", type: "land", enabled: true },
        { country: "Chile", type: "land", enabled: false },
        { country: "Paraguay", type: "land", enabled: false },
        { country: "Uruguay", type: "land", enabled: false },
        { country: "South Africa", type: "sea", enabled: true },
        { country: "United Kingdom", type: "sea", enabled: true } // Via Ilhas Malvinas/Falklands
    ]
},

"Nigeria": { 
    name: "Nigéria", 
    population: { value: 206100000, unit: "pessoas" }, 
    gdp: { value: 440, unit: "bilhões USD" }, 
    treasury: { value: 90, unit: "bilhões USD" }, 
    researchDevelopment: { value: 3, unit: "escala 0-10" }, 
    happiness: { value: 4.8, unit: "escala 0-10" }, 
    military: { navy: 30, airforce: 25, army: 50, space: 0 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Benin", type: "land", enabled: false },
        { country: "Cameroon", type: "land", enabled: false },
        { country: "Chad", type: "land", enabled: false },
        { country: "Niger", type: "land", enabled: true },
        { country: "Brazil", type: "sea", enabled: true }, // Via Atlântico
        { country: "Equatorial Guinea", type: "sea", enabled: false },
        { country: "Ghana", type: "sea", enabled: false },
        { country: "São Tomé and Príncipe", type: "sea", enabled: false }
    ]
},
"Egypt": {
    name: "Egito",
    population: { value: 102300000, unit: "pessoas" },
    gdp: { value: 400, unit: "bilhões USD" },
    treasury: { value: 120, unit: "bilhões USD" },
    researchDevelopment: { value: 5, unit: "escala 0-10" },
    happiness: { value: 4.9, unit: "escala 0-10" },
    military: { navy: 40, airforce: 45, army: 60, space: 5 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Gaza Strip", type: "land", enabled: false },
        { country: "Israel", type: "land", enabled: true },
        { country: "Libya", type: "land", enabled: false },
        { country: "Sudan", type: "land", enabled: false },
        { country: "Greece", type: "sea", enabled: false },
        { country: "Saudi Arabia", type: "sea", enabled: true },
        { country: "Turkey", type: "sea", enabled: true },
        { country: "Cyprus", type: "sea", enabled: false }
    ]
},

"Pakistan": {
    name: "Paquistão",
    population: { value: 220900000, unit: "pessoas" },
    gdp: { value: 350, unit: "bilhões USD" },
    treasury: { value: 80, unit: "bilhões USD" },
    researchDevelopment: { value: 5, unit: "escala 0-10" },
    happiness: { value: 5.1, unit: "escala 0-10" },
    military: { navy: 35, airforce: 40, army: 65, space: 10 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Afghanistan", type: "land", enabled: true },
        { country: "China", type: "land", enabled: true },
        { country: "India", type: "land", enabled: true },
        { country: "Iran", type: "land", enabled: true },
        { country: "Oman", type: "sea", enabled: false },
        { country: "United Arab Emirates", type: "sea", enabled: true }
    ]
},

"Iran": {
    name: "Irã",
    population: { value: 83900000, unit: "pessoas" },
    gdp: { value: 360, unit: "bilhões USD" },
    treasury: { value: 150, unit: "bilhões USD" },
    researchDevelopment: { value: 5, unit: "escala 0-10" },
    happiness: { value: 4.7, unit: "escala 0-10" },
    military: { navy: 45, airforce: 40, army: 60, space: 15 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Afghanistan", type: "land", enabled: true },
        { country: "Armenia", type: "land", enabled: false },
        { country: "Azerbaijan", type: "land", enabled: false },
        { country: "Iraq", type: "land", enabled: false },
        { country: "Pakistan", type: "land", enabled: true },
        { country: "Turkey", type: "land", enabled: true },
        { country: "Turkmenistan", type: "land", enabled: false },
        { country: "Kuwait", type: "sea", enabled: false },
        { country: "Qatar", type: "sea", enabled: false },
        { country: "Saudi Arabia", type: "sea", enabled: true },
        { country: "United Arab Emirates", type: "sea", enabled: true }
    ]
},

"Cuba": {
    name: "Cuba",
    population: { value: 11300000, unit: "pessoas" },
    gdp: { value: 100, unit: "bilhões USD" },
    treasury: { value: 20, unit: "bilhões USD" },
    researchDevelopment: { value: 2, unit: "escala 0-10" },
    happiness: { value: 5.0, unit: "escala 0-10" },
    military: { navy: 20, airforce: 15, army: 30, space: 0 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "United States of America", type: "sea", enabled: true }, // Base de Guantánamo
        { country: "Mexico", type: "sea", enabled: true },
        { country: "Bahamas", type: "sea", enabled: false },
        { country: "Haiti", type: "sea", enabled: false },
        { country: "Jamaica", type: "sea", enabled: false }
    ]
},

"Afghanistan": {
    name: "Afeganistão",
    population: { value: 40100000, unit: "pessoas" },
    gdp: { value: 20, unit: "bilhões USD" },
    treasury: { value: 5, unit: "bilhões USD" },
    researchDevelopment: { value: 1, unit: "escala 0-10" },
    happiness: { value: 2.5, unit: "escala 0-10" },
    military: { navy: 0, airforce: 10, army: 40, space: 0 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "China", type: "land", enabled: true },
        { country: "Iran", type: "land", enabled: true },
        { country: "Pakistan", type: "land", enabled: true },
        { country: "Tajikistan", type: "land", enabled: false },
        { country: "Turkmenistan", type: "land", enabled: false },
        { country: "Uzbekistan", type: "land", enabled: false }
    ]
},
"North Korea": {
    name: "Coreia do Norte",
    population: { value: 25900000, unit: "pessoas" },
    gdp: { value: 30, unit: "bilhões USD" },
    treasury: { value: 8, unit: "bilhões USD" },
    researchDevelopment: { value: 3, unit: "escala 0-10" },
    happiness: { value: 3.0, unit: "escala 0-10" },
    military: { navy: 30, airforce: 30, army: 70, space: 10 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "China", type: "land", enabled: true },
        { country: "South Korea", type: "land", enabled: true },
        { country: "Russia", type: "land", enabled: true },
        { country: "Japan", type: "sea", enabled: true }
    ]
},

"Belarus": {
    name: "Bielorrússia",
    population: { value: 9200000, unit: "pessoas" },
    gdp: { value: 70, unit: "bilhões USD" },
    treasury: { value: 15, unit: "bilhões USD" },
    researchDevelopment: { value: 4, unit: "escala 0-10" },
    happiness: { value: 5.2, unit: "escala 0-10" },
    military: { navy: 0, airforce: 20, army: 35, space: 5 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Latvia", type: "land", enabled: false },
        { country: "Lithuania", type: "land", enabled: false },
        { country: "Poland", type: "land", enabled: true },
        { country: "Russia", type: "land", enabled: true },
        { country: "Ukraine", type: "land", enabled: true }
    ]
},

"Ukraine": {
    name: "Ucrânia",
    population: { value: 36700000, unit: "pessoas" },
    gdp: { value: 160, unit: "bilhões USD" },
    treasury: { value: 25, unit: "bilhões USD" },
    researchDevelopment: { value: 4, unit: "escala 0-10" },
    happiness: { value: 4.0, unit: "escala 0-10" },
    military: { navy: 20, airforce: 30, army: 60, space: 5 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Belarus", type: "land", enabled: true },
        { country: "Hungary", type: "land", enabled: false },
        { country: "Moldova", type: "land", enabled: false },
        { country: "Poland", type: "land", enabled: true },
        { country: "Romania", type: "land", enabled: false },
        { country: "Russia", type: "land", enabled: true },
        { country: "Slovakia", type: "land", enabled: false },
        { country: "Turkey", type: "sea", enabled: true },
        { country: "Georgia", type: "sea", enabled: false }
    ]
},

"Poland": {
    name: "Polônia",
    population: { value: 37700000, unit: "pessoas" },
    gdp: { value: 860, unit: "bilhões USD" },
    treasury: { value: 120, unit: "bilhões USD" },
    researchDevelopment: { value: 6, unit: "escala 0-10" },
    happiness: { value: 6.2, unit: "escala 0-10" },
    military: { navy: 20, airforce: 40, army: 50, space: 5 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Belarus", type: "land", enabled: true },
        { country: "Czech Republic", type: "land", enabled: false },
        { country: "Germany", type: "land", enabled: true },
        { country: "Lithuania", type: "land", enabled: false },
        { country: "Russia", type: "land", enabled: true }, // Kaliningrado
        { country: "Slovakia", type: "land", enabled: false },
        { country: "Ukraine", type: "land", enabled: true },
        { country: "Sweden", type: "sea", enabled: true }
    ]
},

"Democratic Republic of the Congo": {
    name: "Congo (RDC)",
    population: { value: 102300000, unit: "pessoas" },
    gdp: { value: 60, unit: "bilhões USD" },
    treasury: { value: 10, unit: "bilhões USD" },
    researchDevelopment: { value: 2, unit: "escala 0-10" },
    happiness: { value: 4.2, unit: "escala 0-10" },
    military: { navy: 10, airforce: 15, army: 35, space: 0 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Angola", type: "land", enabled: true },
        { country: "Burundi", type: "land", enabled: false },
        { country: "Central African Republic", type: "land", enabled: false },
        { country: "Republic of the Congo", type: "land", enabled: false },
        { country: "Rwanda", type: "land", enabled: false },
        { country: "South Sudan", type: "land", enabled: false },
        { country: "Tanzania", type: "land", enabled: false },
        { country: "Uganda", type: "land", enabled: false },
        { country: "Zambia", type: "land", enabled: false },
        { country: "Brazil", type: "sea", enabled: true } // Via Atlântico
    ]
},

"Niger": {
    name: "Níger",
    population: { value: 27200000, unit: "pessoas" },
    gdp: { value: 15, unit: "bilhões USD" },
    treasury: { value: 4, unit: "bilhões USD" },
    researchDevelopment: { value: 1, unit: "escala 0-10" },
    happiness: { value: 4.0, unit: "escala 0-10" },
    military: { navy: 0, airforce: 10, army: 25, space: 0 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Algeria", type: "land", enabled: false },
        { country: "Benin", type: "land", enabled: false },
        { country: "Burkina Faso", type: "land", enabled: false },
        { country: "Chad", type: "land", enabled: false },
        { country: "Libya", type: "land", enabled: false },
        { country: "Mali", type: "land", enabled: false },
        { country: "Nigeria", type: "land", enabled: true }
    ]
},

"Angola": {
    name: "Angola",
    population: { value: 36700000, unit: "pessoas" },
    gdp: { value: 75, unit: "bilhões USD" },
    treasury: { value: 15, unit: "bilhões USD" },
    researchDevelopment: { value: 4, unit: "escala 0-10" },
    happiness: { value: 5.1, unit: "escala 0-10" },
    military: { navy: 20, airforce: 25, army: 45, space: 0 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Democratic Republic of the Congo", type: "land", enabled: true },
        { country: "Republic of the Congo", type: "land", enabled: false },
        { country: "Namibia", type: "land", enabled: false },
        { country: "Zambia", type: "land", enabled: false },
        { country: "Brazil", type: "sea", enabled: true },
        { country: "Gabon", type: "sea", enabled: false }
    ]
},

"Greenland": {
    name: "Groenlândia",
    population: { value: 56000, unit: "pessoas" },
    gdp: { value: 3, unit: "bilhões USD" },
    treasury: { value: 1, unit: "bilhões USD" },
    researchDevelopment: { value: 3, unit: "escala 0-10" },
    happiness: { value: 6.5, unit: "escala 0-10" },
    military: { navy: 0, airforce: 0, army: 5, space: 0 },
    economicAlliances: [],
    militaryAlliances: [],
    borders: [
        { country: "Canada", type: "sea", enabled: true },
        { country: "Iceland", type: "sea", enabled: false },
        { country: "Norway", type: "sea", enabled: false },
        { country: "Russia", type: "sea", enabled: true }
    ]
},

"Thailand": { 
    name: "Tailândia", 
    population: { value: 69800000, unit: "pessoas" }, 
    gdp: { value: 500, unit: "bilhões USD" }, 
    treasury: { value: 200, unit: "bilhões USD" }, 
    researchDevelopment: { value: 5, unit: "escala 0-10" }, 
    happiness: { value: 6.1, unit: "escala 0-10" }, 
    military: { navy: 40, airforce: 35, army: 50, space: 5 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Myanmar", type: "land", enabled: false },
        { country: "Laos", type: "land", enabled: false },
        { country: "Cambodia", type: "land", enabled: false },
        { country: "Malaysia", type: "land", enabled: false },
        { country: "India", type: "sea", enabled: true },
        { country: "Indonesia", type: "sea", enabled: true },
        { country: "Vietnam", type: "sea", enabled: false }
    ]
},

"United Arab Emirates": { 
    name: "Emirados Árabes Unidos", 
    population: { value: 9900000, unit: "pessoas" }, 
    gdp: { value: 420, unit: "bilhões USD" }, 
    treasury: { value: 700, unit: "bilhões USD" }, 
    researchDevelopment: { value: 8, unit: "escala 0-10" }, 
    happiness: { value: 6.8, unit: "escala 0-10" }, 
    military: { navy: 35, airforce: 40, army: 30, space: 10 }, 
    economicAlliances: [], 
    militaryAlliances: [],
    borders: [
        { country: "Oman", type: "land", enabled: false },
        { country: "Saudi Arabia", type: "land", enabled: true },
        { country: "Iran", type: "sea", enabled: true },
        { country: "Qatar", type: "sea", enabled: false },
        { country: "Pakistan", type: "sea", enabled: true }
    ]
},
    "Israel": {
        name: "Israel",
        population: { value: 9200000, unit: "pessoas" },
        gdp: { value: 480, unit: "bilhões USD" },
        treasury: { value: 150, unit: "bilhões USD" },
        researchDevelopment: { value: 9, unit: "escala 0-10" },
        happiness: { value: 7.4, unit: "escala 0-10" },
        military: { navy: 30, airforce: 50, army: 60, space: 20 },
        economicAlliances: [],
        militaryAlliances: [],
        borders: [
            { country: "Egypt", type: "land", enabled: true },
            { country: "Gaza Strip", type: "land", enabled: false },
            { country: "Jordan", type: "land", enabled: false },
            { country: "Lebanon", type: "land", enabled: false },
            { country: "Syria", type: "land", enabled: false },
            { country: "West Bank", type: "land", enabled: false },
            { country: "Cyprus", type: "sea", enabled: false },
            { country: "Greece", type: "sea", enabled: false },
            { country: "Turkey", type: "sea", enabled: true }
        ]
    },

    "Sweden": {
        name: "Suécia",
        population: { value: 10400000, unit: "pessoas" },
        gdp: { value: 630, unit: "bilhões USD" },
        treasury: { value: 250, unit: "bilhões USD" },
        researchDevelopment: { value: 9, unit: "escala 0-10" },
        happiness: { value: 7.8, unit: "escala 0-10" },
        military: { navy: 35, airforce: 40, army: 30, space: 10 },
        economicAlliances: [],
        militaryAlliances: [],
        borders: [
            { country: "Finland", type: "land", enabled: false },
            { country: "Norway", type: "land", enabled: false },
            { country: "Denmark", type: "sea", enabled: false },
            { country: "Estonia", type: "sea", enabled: false },
            { country: "Germany", type: "sea", enabled: true },
            { country: "Latvia", type: "sea", enabled: false },
            { country: "Lithuania", type: "sea", enabled: false },
            { country: "Poland", type: "sea", enabled: true },
            { country: "Russia", type: "sea", enabled: true }
        ]
    },

    "Switzerland": {
        name: "Suíça",
        population: { value: 8700000, unit: "pessoas" },
        gdp: { value: 800, unit: "bilhões USD" },
        treasury: { value: 300, unit: "bilhões USD" },
        researchDevelopment: { value: 9, unit: "escala 0-10" },
        happiness: { value: 7.9, unit: "escala 0-10" },
        military: { navy: 0, airforce: 30, army: 25, space: 5 },
        economicAlliances: [],
        militaryAlliances: [],
        borders: [
            { country: "Austria", type: "land", enabled: false },
            { country: "France", type: "land", enabled: true },
            { country: "Germany", type: "land", enabled: true },
            { country: "Italy", type: "land", enabled: true },
            { country: "Liechtenstein", type: "land", enabled: false }
        ]
    },

    "Republic of the Congo": {
        name: "Congo",
        population: { value: 5650000, unit: "pessoas" },
        gdp: { value: 45, unit: "bilhões USD" },
        treasury: { value: 8, unit: "bilhões USD" },
        researchDevelopment: { value: 3, unit: "escala 0-10" },
        happiness: { value: 5.3, unit: "escala 0-10" },
        military: { navy: 15, airforce: 20, army: 30, space: 0 },
        economicAlliances: [],
        militaryAlliances: [],
        borders: [
            { country: "Angola", type: "land", enabled: true },
            { country: "Cameroon", type: "land", enabled: false },
            { country: "Central African Republic", type: "land", enabled: false },
            { country: "Democratic Republic of the Congo", type: "land", enabled: true },
            { country: "Gabon", type: "land", enabled: false },
            { country: "Brazil", type: "sea", enabled: true }
        ]
    }
}
