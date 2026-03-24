const menuData = {
    START: {
        title: "Pac-Man",
        content: "Använd pil-tangenterna för att styra.",
        buttons: [{ text: "Starta Spel", action: startGame }] 
    },

    PAUSED: {
        title: "Pausat!",
        content: "Spelet är pausat!",
        buttons: [{ text: "Återuppta spel", action: resumeGame }, { text: "Avsluta spel", action: resetToMain }]
    },

    GAMEOVER: {
        title: (won) => won ? "Du vann!" : "Du förlorade!",
        content: (score) => `Poäng ${score}`,
        buttons: (won) => won ? { text: "Starta nästa nivå", action: startGame } : { title: "Spela igen", action: startGame }

    }


}