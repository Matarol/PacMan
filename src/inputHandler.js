export function setupInput(callbacks) {
    let touchStartX = 0
    let touchstartY = 0
    let minSwipeDist = 20

    //Tangentbord
    window.addEventListener('keydown', ({ key }) => {
        switch (key) {
            case 'ArrowUp': callbacks.setNextDirection('w')
            break
            case 'ArrowLeft': callbacks.setNextDirection('a')
            break
            case 'ArrowDown': callbacks.setNextDirection('s')
            break
            case 'ArrowRight': callbacks.setNextDirection('d')
            break
        }
    })

    //Touch/swipe för mobilanvändare
    window.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX
        touchstartY = e.touches[0].clientY
    }, { passive: false })

    window.addEventListener('touchmove', (e) => {
        if (!callbacks.isGameRunning()) return
        e.preventDefault()

        const touchCurrentX = e.touches[0].clientX
        const touchCurrentY = e.touches[0].clientY

        const dx = touchCurrentX - touchStartX
        const dy = touchCurrentY - touchstartY

        if (Math.abs(dx) > minSwipeDist || Math.abs(dy) > minSwipeDist) {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) callbacks.setNextDirection('d')
                    else
                callbacks.setNextDirection('a')
        } else {
            if (dy > 0) callbacks.setNextDirection('s')
                else
            callbacks.setNextDirection('w')
        }

        touchStartX = touchCurrentX
        touchstartY = touchCurrentY
        }
    }, { passive: false })
}