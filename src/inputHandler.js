export function setupInput(callbacks) {

    function pressKey(dir) {
        keys.w.pressed = false
        keys.a.pressed = false
        keys.s.pressed = false
        keys.d.pressed = false

        keys[dir].pressed = true
        callbacks.setNextDirection(dir)
    }
    const { setNextDirection, togglePause, isGameRunning, keys} = callbacks

    let touchStartX = 0
    let touchstartY = 0
    let minSwipeDist = 15

    window.addEventListener('keydown', (e) => {
        const { key } = e;

        if (
            key === 'ArrowUp' ||
            key === 'ArrowDown' ||
            key === 'ArrowLeft' ||
            key === 'ArrowRight' ||
            key === ' '
        ) {
            e.preventDefault();
        }
        switch (key) {
            case 'ArrowUp':
                keys.w.pressed = true
                setNextDirection('w')
            break
            case 'ArrowLeft':
                keys.a.pressed = true
                setNextDirection('a')
            break
            case 'ArrowDown':
                keys.s.pressed = true
                setNextDirection('s')
            break
            case 'ArrowRight':
                keys.d.pressed = true
                setNextDirection('d')
            break
            case 'Escape': callbacks.togglePause()
            break
        }
    })

    window.addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'ArrowUp':
            keys.w.pressed = false
            break
        case 'ArrowLeft':
            keys.a.pressed = false
            break
        case 'ArrowDown':
            keys.s.pressed = false
            break
        case 'ArrowRight':
            keys.d.pressed = false
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
                if (dx > 0) pressKey('d')
                    else
                pressKey('a')
        } else {
            if (dy > 0) pressKey('s')
                else
            pressKey('w')
        }

        touchStartX = touchCurrentX
        touchstartY = touchCurrentY
        }
    }, { passive: false })

    window.addEventListener('touchend', () => {
        keys.w.pressed = false
        keys.a.pressed = false
        keys.s.pressed = false
        keys.d.pressed = false
    })
}