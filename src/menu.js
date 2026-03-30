const uiOverlay = document.getElementById('ui-overlay')
const menuTitle = document.getElementById('menu-title')
const menuContent = document.getElementById('menu-content')
const menuButtons = document.getElementById('menu-buttons')

if (!uiOverlay) {
        console.error("Kunde inte hitta #ui-overlay i HTML!");
    }

export const showMenu = (state, callbacks, options = {}) => {
    const menuData = {
        START: {
            title: "Pac-Man",
            content: "Använd pil-tangenterna för att styra.",
            buttons: [{ text: "Starta Spel", action: callbacks.startGame }] 
        },

        PAUSED: {
            title: "Pausat!",
            content: "Spelet är pausat!",
            buttons: [{ text: "Återuppta spel", action: callbacks.resumeGame }, { text: "Avsluta spel", action: callbacks.resetToMain }]
        },

        GAMEOVER: {
            title: options.won ? "Du vann!" : "Du förlorade!",
            content: `Poäng: ${options.score}`,
            buttons: [
                { text: options.won ? "Starta nästa nivå" : "Spela igen", action: callbacks.startGame }
            ]            
        },

        BONUSLVLCOMPLETE: {
            title: "Extrabana avklarad",
            content: `Bonuspoäng denna nivå: ${options.score}`,
            buttons: [
                { text: "Fortsätt spela", action: callbacks.resumeGame },
                {text: "Avsluta spel", action: callbacks.resetToMain }
            ]
        }
    }

    const data = menuData[state]
    if (!data) return

    menuButtons.innerHTML = ''
    menuTitle.innerText = data.title
    menuContent.innerText = data.content

    data.buttons.forEach(btn => {
        const buttonEl = document.createElement('button')
        buttonEl.innerText = btn.text
        buttonEl.onclick = () => {
            uiOverlay.classList.add('hidden')
            btn.action()
        }
        menuButtons.appendChild(buttonEl)
    })

    uiOverlay.classList.remove('hidden')
}