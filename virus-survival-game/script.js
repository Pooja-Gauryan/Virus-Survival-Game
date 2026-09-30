// =====================================================
// 🦠 VIRUS SURVIVAL GAME
// PHASE 3 - LIVES + INFECTION SYSTEM
// =====================================================


// =====================================================
// CONFIGURATION
// =====================================================

const ROWS = 20;
const COLS = 30;

const WALLS = 35;
const BOMBS = Math.round(0.10 * ROWS * COLS);
const TRAPS = Math.round(0.05 * ROWS * COLS);
const VTRAPS = Math.round(0.07 * ROWS * COLS);

const SHIELD_COUNT = 1;
const DOUBLE_COUNT = 1;
const ENERGY_COUNT = 1;


// =====================================================
// PHASE 3 CONFIGURATION
// =====================================================

const MAX_LIVES = 3;

const MAX_INFECTION = 100;

const BOMB_INFECTION = 0;

const VTRAP_INFECTION = 35;

const ENEMY_INFECTION = 25;

const ENERGY_RECOVERY = 10;


// =====================================================
// GAME STATE
// =====================================================

let grid = [];

let playerPos = {
    r: 0,
    c: 0
};

let enemyPos = {
    r: 0,
    c: 0
};

let turn = 0;

let score = 0;

let lives = MAX_LIVES;

let infection = 0;

let shieldTurns = 0;

let doubleMove = false;

let timer = 0;

let timerInterval = null;

let gameOverFlag = false;

let gameStarted = false;


// =====================================================
// AUDIO
// =====================================================

const moveSound =
    new Audio("sounds/move.mp3");

const hazardSound =
    new Audio("sounds/hazard.mp3");

const powerupSound =
    new Audio("sounds/powerup.mp3");

const winSound =
    new Audio("sounds/win.mp3");

const loseSound =
    new Audio("sounds/lose.mp3");


// =====================================================
// DOM REFERENCES
// =====================================================

const board =
    document.getElementById("board");

const messageDiv =
    document.getElementById("message");

const gameOverPanel =
    document.getElementById("gameOverPanel");

const gameOverBox =
    document.getElementById("gameOverBox");

const hintCheckbox =
    document.getElementById("hintCheckbox");

const startScreen =
    document.getElementById("startScreen");

const startBtn =
    document.getElementById("startBtn");

const instructionOverlay =
    document.getElementById("instructionOverlay");

const instructionOkay =
    document.getElementById("instructionOkay");

const dontRemindBtn =
    document.getElementById("dontRemindBtn");


// =====================================================
// BEST SCORE
// =====================================================

let bestScore =
    Number(
        localStorage.getItem("bestScore")
    ) || 0;

document.getElementById(
    "bestScore"
).innerText = bestScore;


// =====================================================
// AUDIO HELPER
// =====================================================

function playSound(sound) {

    try {

        if (!sound) return;

        sound.currentTime = 0;

        const promise =
            sound.play();

        if (promise) {

            promise.catch(
                () => {}
            );
        }

    } catch (error) {

        // Audio may be blocked.
    }
}


// =====================================================
// VIBRATION HELPER
// =====================================================

function vibrate(pattern) {

    try {

        if (
            navigator.vibrate &&
            typeof navigator.vibrate ===
                "function"
        ) {

            navigator.vibrate(
                pattern
            );
        }

    } catch (error) {

        // Vibration unavailable.
    }
}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    message,
    color = ""
) {

    messageDiv.innerText =
        message;

    if (color) {

        messageDiv.style.color =
            color;
    }

    messageDiv.classList.remove(
        "messagePop"
    );

    void messageDiv.offsetWidth;

    messageDiv.classList.add(
        "messagePop"
    );
}


// =====================================================
// BOARD EFFECT
// =====================================================

function boardEffect(
    className
) {

    if (!board) return;

    board.classList.remove(
        className
    );

    void board.offsetWidth;

    board.classList.add(
        className
    );

    setTimeout(() => {

        board.classList.remove(
            className
        );

    }, 500);
}


// =====================================================
// CELL EFFECT
// =====================================================

function cellEffect(
    row,
    col,
    className
) {

    if (!board) return;

    const index =
        row * COLS + col;

    const cell =
        board.children[index];

    if (!cell) return;

    cell.classList.remove(
        className
    );

    void cell.offsetWidth;

    cell.classList.add(
        className
    );

    setTimeout(() => {

        cell.classList.remove(
            className
        );

    }, 700);
}


// =====================================================
// SCREEN EFFECT
// =====================================================

function screenEffect(
    className
) {

    const effect =
        document.createElement(
            "div"
        );

    effect.className =
        "screenEffect " +
        className;

    document.body.appendChild(
        effect
    );

    setTimeout(() => {

        effect.remove();

    }, 550);
}


// =====================================================
// RANDOM EMPTY CELL
// =====================================================

function getRandomEmptyCell() {

    const availableCells = [];

    for (
        let r = 0;
        r < ROWS;
        r++
    ) {

        for (
            let c = 0;
            c < COLS;
            c++
        ) {

            if (
                grid[r][c] ===
                    "empty" &&

                !(r === 0 && c === 0) &&

                !(
                    r === ROWS - 1 &&
                    c === COLS - 1
                )
            ) {

                availableCells.push({
                    r,
                    c
                });
            }
        }
    }


    if (
        availableCells.length === 0
    ) {

        return null;
    }


    return availableCells[
        Math.floor(
            Math.random() *
            availableCells.length
        )
    ];
}


// =====================================================
// PLACE OBJECTS
// =====================================================

function placeObjects(
    type,
    count
) {

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const cell =
            getRandomEmptyCell();

        if (!cell) return;

        grid[
            cell.r
        ][
            cell.c
        ] = type;
    }
}


// =====================================================
// INITIALIZE GAME
// =====================================================

function initializeGame() {

    clearInterval(
        timerInterval
    );


    grid = [];


    playerPos = {
        r: 0,
        c: 0
    };


    enemyPos = {
        r: 0,
        c: 0
    };


    turn = 0;

    score = 0;

    lives = MAX_LIVES;

    infection = 0;

    shieldTurns = 0;

    doubleMove = false;

    timer = 0;

    gameOverFlag = false;


    // ---------------------------------------------
    // CREATE EMPTY GRID
    // ---------------------------------------------

    for (
        let r = 0;
        r < ROWS;
        r++
    ) {

        grid[r] = [];

        for (
            let c = 0;
            c < COLS;
            c++
        ) {

            grid[r][c] =
                "empty";
        }
    }


    // ---------------------------------------------
    // PLAYER
    // ---------------------------------------------

    grid[0][0] =
        "player";


    // ---------------------------------------------
    // EXIT
    // ---------------------------------------------

    grid[
        ROWS - 1
    ][
        COLS - 1
    ] = "exit";


    // ---------------------------------------------
    // HAZARDS
    // ---------------------------------------------

    placeObjects(
        "wall",
        WALLS
    );

    placeObjects(
        "bomb",
        BOMBS
    );

    placeObjects(
        "trap",
        TRAPS
    );

    placeObjects(
        "vtrap",
        VTRAPS
    );


    // ---------------------------------------------
    // POWER UPS
    // ---------------------------------------------

    placeObjects(
        "S",
        SHIELD_COUNT
    );

    placeObjects(
        "D",
        DOUBLE_COUNT
    );

    placeObjects(
        "*",
        ENERGY_COUNT
    );


    // ---------------------------------------------
    // ENEMY
    // ---------------------------------------------

    const enemyCell =
        getRandomEmptyCell();


    if (enemyCell) {

        enemyPos = {
            r: enemyCell.r,
            c: enemyCell.c
        };
    }


    // ---------------------------------------------
    // RENDER
    // ---------------------------------------------

    renderBoard();
}


// =====================================================
// TIMER
// =====================================================

function startTimer() {

    clearInterval(
        timerInterval
    );


    timer = 0;


    document.getElementById(
        "timer"
    ).innerText =
        timer;


    timerInterval =
        setInterval(
            () => {

                if (
                    gameOverFlag ||
                    !gameStarted
                ) {

                    return;
                }


                timer++;


                document.getElementById(
                    "timer"
                ).innerText =
                    timer;

            },
            1000
        );
}


// =====================================================
// BFS HINT
// =====================================================

function getHintPath() {

    const visited =
        Array.from(
            {
                length: ROWS
            },
            () =>
                Array(
                    COLS
                ).fill(false)
        );


    const previous =
        Array.from(
            {
                length: ROWS
            },
            () =>
                Array(
                    COLS
                ).fill(null)
        );


    const queue = [
        {
            r: playerPos.r,
            c: playerPos.c
        }
    ];


    visited[
        playerPos.r
    ][
        playerPos.c
    ] = true;


    let exitPos = null;


    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];


    while (
        queue.length > 0
    ) {

        const current =
            queue.shift();


        const r = current.r;

        const c = current.c;


        if (
            grid[r][c] ===
            "exit"
        ) {

            exitPos = {
                r,
                c
            };

            break;
        }


        for (
            const [dr, dc]
            of directions
        ) {

            const nr =
                r + dr;

            const nc =
                c + dc;


            if (
                nr < 0 ||
                nr >= ROWS ||
                nc < 0 ||
                nc >= COLS
            ) {

                continue;
            }


            if (
                visited[nr][nc]
            ) {

                continue;
            }


            const cellType =
                grid[nr][nc];


            if (
                cellType ===
                    "wall" ||

                cellType ===
                    "bomb" ||

                cellType ===
                    "vtrap"
            ) {

                continue;
            }


            visited[nr][nc] =
                true;


            previous[nr][nc] = {
                r,
                c
            };


            queue.push({
                r: nr,
                c: nc
            });
        }
    }


    if (!exitPos) {

        return [];
    }


    const path = [];

    let current =
        exitPos;


    while (
        current &&

        !(
            current.r ===
                playerPos.r &&

            current.c ===
                playerPos.c
        )
    ) {

        path.push(
            current
        );


        current =
            previous[
                current.r
            ][
                current.c
            ];
    }


    return path.reverse();
}


// =====================================================
// RENDER BOARD
// =====================================================

function renderBoard() {

    board.innerHTML = "";


    const hint =
        hintCheckbox &&
        hintCheckbox.checked
            ? getHintPath()
            : [];


    for (
        let r = 0;
        r < ROWS;
        r++
    ) {

        for (
            let c = 0;
            c < COLS;
            c++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.classList.add(
                "cell"
            );


            // -----------------------------------------
            // HINT
            // -----------------------------------------

            const isHint =
                hint.some(
                    position =>
                        position.r ===
                            r &&

                        position.c ===
                            c
                );


            if (isHint) {

                cell.classList.add(
                    "hint"
                );
            }


            // -----------------------------------------
            // ENEMY
            // -----------------------------------------

            if (
                enemyPos.r === r &&
                enemyPos.c === c
            ) {

                cell.classList.add(
                    "enemy"
                );

                cell.innerText =
                    "👾";

            }

            else {

                const type =
                    grid[r][c];


                const typeClass = {

                    player:
                        "player",

                    wall:
                        "wall",

                    bomb:
                        "bomb",

                    trap:
                        "trap",

                    vtrap:
                        "vtrap",

                    exit:
                        "exit",

                    S:
                        "shield",

                    D:
                        "double",

                    "*":
                        "energy",

                    empty:
                        "empty"

                }[type] ||
                    "empty";


                cell.classList.add(
                    typeClass
                );


                const emoji = {

                    player:
                        "🧍",

                    bomb:
                        "💣",

                    trap:
                        "⚠️",

                    vtrap:
                        "☠️",

                    exit:
                        "🏁",

                    S:
                        "🛡️",

                    D:
                        "⚡",

                    "*":
                        "⭐"

                }[type];


                cell.innerText =
                    emoji || "";
            }


            // -----------------------------------------
            // DATA
            // -----------------------------------------

            cell.dataset.row =
                r;

            cell.dataset.col =
                c;


            board.appendChild(
                cell
            );
        }
    }


    updateUI();
}


// =====================================================
// UPDATE UI
// =====================================================

function updateUI() {

    // ---------------------------------------------
    // BASIC STATS
    // ---------------------------------------------

    document.getElementById(
        "turn"
    ).innerText =
        turn;


    document.getElementById(
        "shield"
    ).innerText =
        shieldTurns;


    document.getElementById(
        "doubleMove"
    ).innerText =
        doubleMove
            ? "ON"
            : "OFF";


    document.getElementById(
        "score"
    ).innerText =
        score;


    document.getElementById(
        "bestScore"
    ).innerText =
        bestScore;


    document.getElementById(
        "timer"
    ).innerText =
        timer;


    // ---------------------------------------------
    // LIVES
    // ---------------------------------------------

    const livesElement =
        document.getElementById(
            "lives"
        );


    if (livesElement) {

        livesElement.innerText =
            lives;
    }


    // ---------------------------------------------
    // INFECTION
    // ---------------------------------------------

    const infectionElement =
        document.getElementById(
            "infection"
        );


    const infectionText =
        document.getElementById(
            "infectionText"
        );


    const infectionFill =
        document.getElementById(
            "infectionFill"
        );


    if (infectionElement) {

        infectionElement.innerText =
            infection + "%";
    }


    if (infectionText) {

        infectionText.innerText =
            infection + "%";
    }


    if (infectionFill) {

        infectionFill.style.width =
            infection + "%";


        // -----------------------------------------
        // Infection visual state
        // -----------------------------------------

        infectionFill.classList.remove(
            "infectionSafe",
            "infectionWarning",
            "infectionDanger"
        );


        if (infection < 50) {

            infectionFill.classList.add(
                "infectionSafe"
            );

        }

        else if (
            infection < 80
        ) {

            infectionFill.classList.add(
                "infectionWarning"
            );

        }

        else {

            infectionFill.classList.add(
                "infectionDanger"
            );
        }
    }
}


// =====================================================
// INFECTION SYSTEM
// =====================================================

function increaseInfection(
    amount
) {

    if (
        amount <= 0
    ) {

        return;
    }


    infection =
        Math.min(
            MAX_INFECTION,
            infection + amount
        );


    updateUI();


    // ---------------------------------------------
    // Infection warning
    // ---------------------------------------------

    if (
        infection >= 80 &&
        infection < 100
    ) {

        showMessage(
            "🚨 CRITICAL INFECTION LEVEL — FIND A WAY TO RECOVER!",
            "#ff4d6d"
        );


        screenEffect(
            "infectionWarningFlash"
        );
    }


    // ---------------------------------------------
    // Infection reached 100
    // ---------------------------------------------

    if (
        infection >=
        MAX_INFECTION
    ) {

        infection =
            MAX_INFECTION;


        updateUI();


        playSound(
            loseSound
        );


        vibrate([
            120,
            50,
            180,
            50,
            220
        ]);


        screenEffect(
            "infectionGameOver"
        );


        boardEffect(
            "boardShakeHard"
        );


        showMessage(
            "☠️ INFECTION REACHED 100%!",
            "#ff3355"
        );


        triggerGameOver(
            "☠️",
            "The virus completely infected you."
        );


        return true;
    }


    return false;
}


// =====================================================
// REDUCE INFECTION
// =====================================================

function reduceInfection(
    amount
) {

    if (
        amount <= 0
    ) {

        return;
    }


    const oldInfection =
        infection;


    infection =
        Math.max(
            0,
            infection - amount
        );


    const recovered =
        oldInfection -
        infection;


    if (
        recovered > 0
    ) {

        updateUI();


        showMessage(
            `💚 INFECTION REDUCED BY ${recovered}%!`,
            "#35e889"
        );


        screenEffect(
            "recoveryFlash"
        );
    }
}


// =====================================================
// LOSE LIFE
// =====================================================

function loseLife(
    reason,
    infectionAmount = 0
) {

    if (
        gameOverFlag
    ) {

        return;
    }


    // ---------------------------------------------
    // Infection increase
    // ---------------------------------------------

    if (
        infectionAmount > 0
    ) {

        const infectionKilled =
            increaseInfection(
                infectionAmount
            );


        if (
            infectionKilled
        ) {

            return;
        }
    }


    // ---------------------------------------------
    // Remove one life
    // ---------------------------------------------

    lives =
        Math.max(
            0,
            lives - 1
        );


    updateUI();


    // ---------------------------------------------
    // Game over if no lives
    // ---------------------------------------------

    if (
        lives <= 0
    ) {

        playSound(
            loseSound
        );


        vibrate([
            100,
            50,
            180
        ]);


        showMessage(
            "💔 NO LIVES LEFT!",
            "#ff3355"
        );


        triggerGameOver(
            "💔",
            reason
        );


        return;
    }


    // ---------------------------------------------
    // Respawn
    // ---------------------------------------------

    respawnPlayer();


    showMessage(
        `💔 LIFE LOST! ${lives} LIFE${lives === 1 ? "" : "S"} REMAINING.`,
        "#ff647d"
    );


    screenEffect(
        "lifeLostFlash"
    );


    boardEffect(
        "boardShakeHard"
    );


    updateUI();
}


// =====================================================
// RESPAWN PLAYER
// =====================================================

function respawnPlayer() {

    // ---------------------------------------------
    // Remove player from current location
    // ---------------------------------------------

    if (
        grid[
            playerPos.r
        ] &&
        grid[
            playerPos.r
        ][
            playerPos.c
        ] === "player"
    ) {

        grid[
            playerPos.r
        ][
            playerPos.c
        ] = "empty";
    }


    // ---------------------------------------------
    // Move player to base
    // ---------------------------------------------

    playerPos = {
        r: 0,
        c: 0
    };


    // ---------------------------------------------
    // Base must always be player
    // ---------------------------------------------

    grid[0][0] =
        "player";


    renderBoard();


    cellEffect(
        0,
        0,
        "respawnEffect"
    );
}


// =====================================================
// MOVE PLAYER
// =====================================================

function movePlayer(
    dr,
    dc
) {

    if (
        !gameStarted ||
        gameOverFlag
    ) {

        return;
    }


    const newR =
        playerPos.r + dr;

    const newC =
        playerPos.c + dc;


    // ---------------------------------------------
    // BOUNDARY
    // ---------------------------------------------

    if (
        newR < 0 ||
        newR >= ROWS ||
        newC < 0 ||
        newC >= COLS
    ) {

        showMessage(
            "🚧 You can't move outside the grid.",
            "#8b9aaa"
        );


        boardEffect(
            "boardShake"
        );


        return;
    }


    const target =
        grid[newR][newC];


    // ---------------------------------------------
    // WALL
    // ---------------------------------------------

    if (
        target === "wall"
    ) {

        showMessage(
            "🧱 WALL BLOCKED YOUR PATH!",
            "#b9c5cc"
        );


        cellEffect(
            newR,
            newC,
            "wallHit"
        );


        boardEffect(
            "boardShake"
        );


        vibrate(15);

        return;
    }


    // ---------------------------------------------
    // MOVE PLAYER
    // ---------------------------------------------

    grid[
        playerPos.r
    ][
        playerPos.c
    ] = "empty";


    playerPos = {
        r: newR,
        c: newC
    };


    grid[
        playerPos.r
    ][
        playerPos.c
    ] = "player";


    playSound(
        moveSound
    );


    vibrate(10);


    turn++;

    score++;


    renderBoard();


    cellEffect(
        playerPos.r,
        playerPos.c,
        "playerMove"
    );


    // =================================================
    // BOMB
    // =================================================

    if (
        target === "bomb"
    ) {

        if (
            shieldTurns > 0
        ) {

            shieldTurns--;


            playSound(
                powerupSound
            );


            vibrate([
                30,
                20,
                50
            ]);


            screenEffect(
                "shieldFlash"
            );


            cellEffect(
                newR,
                newC,
                "shieldHit"
            );


            showMessage(
                "🛡️ SHIELD ABSORBED THE BOMB!",
                "#00d9c5"
            );


            renderBoard();

        }

        else {

            playSound(
                hazardSound
            );


            vibrate([
                80,
                40,
                120
            ]);


            screenEffect(
                "bombFlash"
            );


            boardEffect(
                "boardShakeHard"
            );


            cellEffect(
                newR,
                newC,
                "bombHit"
            );


            loseLife(
                "💣 The bomb destroyed your final life.",
                BOMB_INFECTION
            );


            if (
                gameOverFlag
            ) {

                return;
            }


            renderBoard();

            return;
        }
    }


    // =================================================
    // VIRUS TRAP
    // =================================================

    else if (
        target === "vtrap"
    ) {

        if (
            shieldTurns > 0
        ) {

            shieldTurns--;


            playSound(
                powerupSound
            );


            vibrate([
                30,
                20,
                50
            ]);


            screenEffect(
                "shieldFlash"
            );


            cellEffect(
                newR,
                newC,
                "shieldHit"
            );


            showMessage(
                "🛡️ SHIELD BLOCKED THE VIRUS!",
                "#00d9c5"
            );


            renderBoard();

        }

        else {

            playSound(
                hazardSound
            );


            vibrate([
                80,
                40,
                120
            ]);


            screenEffect(
                "virusFlash"
            );


            boardEffect(
                "boardShakeHard"
            );


            cellEffect(
                newR,
                newC,
                "virusHit"
            );


            loseLife(
                "☠️ The virus consumed your final life.",
                VTRAP_INFECTION
            );


            if (
                gameOverFlag
            ) {

                return;
            }


            renderBoard();

            return;
        }
    }


    // =================================================
    // TRAP
    // =================================================

    else if (
        target === "trap"
    ) {

        vibrate([
            40,
            30,
            50
        ]);


        screenEffect(
            "trapFlash"
        );


        cellEffect(
            newR,
            newC,
            "trapHit"
        );


        showMessage(
            "⚠️ TRAP TRIGGERED — RETURNING TO BASE!",
            "#ffad42"
        );


        grid[
            playerPos.r
        ][
            playerPos.c
        ] = "empty";


        playerPos = {
            r: 0,
            c: 0
        };


        grid[0][0] =
            "player";


        renderBoard();


        cellEffect(
            0,
            0,
            "teleportEffect"
        );
    }


    // =================================================
    // SHIELD
    // =================================================

    else if (
        target === "S"
    ) {

        shieldTurns = 3;

        score += 10;


        playSound(
            powerupSound
        );


        vibrate([
            30,
            20,
            60
        ]);


        screenEffect(
            "powerupFlash"
        );


        cellEffect(
            newR,
            newC,
            "powerupCollect"
        );


        showMessage(
            "🛡️ SHIELD ONLINE — 3 TURNS PROTECTED!",
            "#00e6d0"
        );


        renderBoard();
    }


    // =================================================
    // DOUBLE MOVE
    // =================================================

    else if (
        target === "D"
    ) {

        doubleMove = true;

        score += 10;


        playSound(
            powerupSound
        );


        vibrate([
            30,
            20,
            60
        ]);


        cellEffect(
            newR,
            newC,
            "powerupCollect"
        );


        showMessage(
            "⚡ DOUBLE MOVE ACTIVATED!",
            "#ff9f43"
        );


        renderBoard();
    }


    // =================================================
    // ENERGY
    // =================================================

    else if (
        target === "*"
    ) {

        score += 5;


        reduceInfection(
            ENERGY_RECOVERY
        );


        playSound(
            powerupSound
        );


        vibrate(35);


        cellEffect(
            newR,
            newC,
            "energyCollect"
        );


        showMessage(
            infection > 0
                ? "⭐ ENERGY COLLECTED — INFECTION -10%!"
                : "⭐ ENERGY COLLECTED — +5 SCORE!",
            infection > 0
                ? "#35e889"
                : "#ffd166"
        );


        renderBoard();
    }


    // =================================================
    // EXIT
    // =================================================

    else if (
        target === "exit"
    ) {

        score += 50;


        playSound(
            winSound
        );


        vibrate([
            50,
            30,
            70,
            30,
            120
        ]);


        screenEffect(
            "victoryFlash"
        );


        cellEffect(
            newR,
            newC,
            "exitVictory"
        );


        showMessage(
            "🏁 EXTRACTION SUCCESSFUL!",
            "#35e889"
        );


        triggerGameOver(
            "🎉",
            "You successfully escaped the virus!",
            true
        );


        renderBoard();

        return;
    }


    // =================================================
    // DOUBLE MOVE STATUS
    // =================================================

    if (
        doubleMove
    ) {

        doubleMove = false;


        showMessage(
            "⚡ Extra move available!",
            "#ff9f43"
        );
    }


    // =================================================
    // HAZARD SHUFFLE
    // =================================================

    shuffleHazards();


    // =================================================
    // RANDOM POWER UP
    // =================================================

    spawnRandomPowerUp();


    // =================================================
    // ENEMY
    // =================================================

    moveEnemy();


    // =================================================
    // FINAL RENDER
    // =================================================

    renderBoard();
}


// =====================================================
// HAZARD SHUFFLING
// =====================================================

function shuffleHazards() {

    const hazardTypes = [
        "bomb",
        "trap",
        "vtrap"
    ];


    for (
        const type
        of hazardTypes
    ) {

        const positions = [];


        for (
            let r = 0;
            r < ROWS;
            r++
        ) {

            for (
                let c = 0;
                c < COLS;
                c++
            ) {

                if (
                    grid[r][c] ===
                    type
                ) {

                    positions.push({
                        r,
                        c
                    });
                }
            }
        }


        if (
            positions.length === 0
        ) {

            continue;
        }


        const moves =
            Math.max(
                1,
                Math.floor(
                    positions.length *
                    0.15
                )
            );


        for (
            let i = 0;
            i < moves;
            i++
        ) {

            if (
                positions.length === 0
            ) {

                break;
            }


            const index =
                Math.floor(
                    Math.random() *
                    positions.length
                );


            const oldPosition =
                positions.splice(
                    index,
                    1
                )[0];


            if (
                oldPosition.r ===
                    playerPos.r &&
                oldPosition.c ===
                    playerPos.c
            ) {

                continue;
            }


            grid[
                oldPosition.r
            ][
                oldPosition.c
            ] = "empty";


            const newPosition =
                getRandomEmptyCell();


            if (
                newPosition
            ) {

                grid[
                    newPosition.r
                ][
                    newPosition.c
                ] = type;
            }
        }
    }
}


// =====================================================
// RANDOM POWER-UP
// =====================================================

function spawnRandomPowerUp() {

    if (
        Math.random() > 0.08
    ) {

        return;
    }


    const cell =
        getRandomEmptyCell();


    if (!cell) {

        return;
    }


    const powerUps = [
        "S",
        "*"
    ];


    const powerUp =
        powerUps[
            Math.floor(
                Math.random() *
                powerUps.length
            )
        ];


    grid[
        cell.r
    ][
        cell.c
    ] = powerUp;
}


// =====================================================
// ENEMY AI
// =====================================================

function moveEnemy() {

    if (
        gameOverFlag
    ) {

        return;
    }


    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];


    const dr =
        playerPos.r -
        enemyPos.r;


    const dc =
        playerPos.c -
        enemyPos.c;


    // ---------------------------------------------
    // 65% CHASE
    // ---------------------------------------------

    if (
        Math.random() < 0.65
    ) {

        if (
            Math.abs(dr) >
            Math.abs(dc)
        ) {

            enemyPos.r +=
                Math.sign(dr);

        } else {

            enemyPos.c +=
                Math.sign(dc);
        }

    }

    // ---------------------------------------------
    // RANDOM MOVEMENT
    // ---------------------------------------------

    else {

        const direction =
            directions[
                Math.floor(
                    Math.random() *
                    directions.length
                )
            ];


        enemyPos.r +=
            direction[0];

        enemyPos.c +=
            direction[1];
    }


    // ---------------------------------------------
    // BOUNDARY
    // ---------------------------------------------

    enemyPos.r =
        Math.max(
            0,
            Math.min(
                ROWS - 1,
                enemyPos.r
            )
        );


    enemyPos.c =
        Math.max(
            0,
            Math.min(
                COLS - 1,
                enemyPos.c
            )
        );


    // ---------------------------------------------
    // RENDER
    // ---------------------------------------------

    renderBoard();


    cellEffect(
        enemyPos.r,
        enemyPos.c,
        "enemyMove"
    );


    // ---------------------------------------------
    // COLLISION
    // ---------------------------------------------

    if (
        enemyPos.r ===
            playerPos.r &&

        enemyPos.c ===
            playerPos.c
    ) {

        playSound(
            hazardSound
        );


        vibrate([
            100,
            40,
            150
        ]);


        screenEffect(
            "enemyFlash"
        );


        boardEffect(
            "boardShakeHard"
        );


        showMessage(
            "👾 ENEMY DETECTED YOU!",
            "#ff3355"
        );


        loseLife(
            "👾 The enemy took your final life.",
            ENEMY_INFECTION
        );
    }
}


// =====================================================
// GAME OVER
// =====================================================

function triggerGameOver(
    emoji,
    message,
    win = false
) {

    if (
        gameOverFlag
    ) {

        return;
    }


    gameOverFlag = true;


    clearInterval(
        timerInterval
    );


    // ---------------------------------------------
    // Result
    // ---------------------------------------------

    document.getElementById(
        "gameOverEmoji"
    ).innerText =
        emoji;


    document.getElementById(
        "gameOverTitle"
    ).innerText =
        win
            ? "Victory!"
            : "Game Over";


    document.getElementById(
        "gameOverText"
    ).innerText =
        message;


    // ---------------------------------------------
    // Final Score
    // ---------------------------------------------

    document.getElementById(
        "finalScore"
    ).innerText =
        score;


    // ---------------------------------------------
    // Final Time
    // ---------------------------------------------

    document.getElementById(
        "finalTime"
    ).innerText =
        timer;


    // ---------------------------------------------
    // Final Turns
    // ---------------------------------------------

    document.getElementById(
        "finalTurns"
    ).innerText =
        turn;


    // ---------------------------------------------
    // Final Lives
    // ---------------------------------------------

    const finalLives =
        document.getElementById(
            "finalLives"
        );


    if (finalLives) {

        finalLives.innerText =
            lives;
    }


    // ---------------------------------------------
    // Final Infection
    // ---------------------------------------------

    const finalInfection =
        document.getElementById(
            "finalInfection"
        );


    if (finalInfection) {

        finalInfection.innerText =
            infection + "%";
    }


    // ---------------------------------------------
    // Box Style
    // ---------------------------------------------

    gameOverBox.classList.remove(
        "winBox",
        "loseBox"
    );


    gameOverBox.classList.add(
        win
            ? "winBox"
            : "loseBox"
    );


    // ---------------------------------------------
    // Show Panel
    // ---------------------------------------------

    gameOverPanel.classList.remove(
        "hidden"
    );


    // ---------------------------------------------
    // Best Score
    // ---------------------------------------------

    updateBestScore(
        score
    );
}


// =====================================================
// BEST SCORE
// =====================================================

function updateBestScore(
    currentScore
) {

    if (
        currentScore > bestScore
    ) {

        bestScore =
            currentScore;


        localStorage.setItem(
            "bestScore",
            bestScore
        );
    }


    document.getElementById(
        "bestScore"
    ).innerText =
        bestScore;
}


// =====================================================
// KEYBOARD CONTROLS
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            !gameStarted ||
            gameOverFlag
        ) {

            return;
        }


        const key =
            event.key.toLowerCase();


        const movementKeys = [
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
            "w",
            "a",
            "s",
            "d"
        ];


        if (
            movementKeys.includes(
                key
            )
        ) {

            event.preventDefault();
        }


        if (
            key === "w" ||
            key === "arrowup"
        ) {

            movePlayer(
                -1,
                0
            );

        }

        else if (
            key === "s" ||
            key === "arrowdown"
        ) {

            movePlayer(
                1,
                0
            );

        }

        else if (
            key === "a" ||
            key === "arrowleft"
        ) {

            movePlayer(
                0,
                -1
            );

        }

        else if (
            key === "d" ||
            key === "arrowright"
        ) {

            movePlayer(
                0,
                1
            );
        }
    }
);


// =====================================================
// HINT
// =====================================================

hintCheckbox.addEventListener(
    "change",
    function () {

        renderBoard();


        if (
            hintCheckbox.checked
        ) {

            showMessage(
                "🧠 AI ROUTE CALCULATED — Follow the blue path.",
                "#56b8ff"
            );
        }
    }
);


// =====================================================
// START GAME
// =====================================================

function startGame() {

    startScreen.classList.add(
        "hidden"
    );


    instructionOverlay.classList.add(
        "hidden"
    );


    gameOverPanel.classList.add(
        "hidden"
    );


    gameStarted = true;


    initializeGame();


    startTimer();


    showMessage(
        "🦠 SYSTEM ONLINE — SURVIVE THE INFECTED GRID!",
        "#48aaff"
    );


    setTimeout(() => {

        cellEffect(
            0,
            0,
            "gameStartEffect"
        );

    }, 100);
}


// =====================================================
// START BUTTON
// =====================================================

startBtn.addEventListener(
    "click",
    function () {

        const dontShowAgain =
            localStorage.getItem(
                "virusGameDontRemind"
            );


        if (
            dontShowAgain === "true"
        ) {

            startGame();

        }

        else {

            startScreen.classList.add(
                "hidden"
            );


            instructionOverlay.classList.remove(
                "hidden"
            );
        }
    }
);


// =====================================================
// INSTRUCTION OKAY
// =====================================================

instructionOkay.addEventListener(
    "click",
    function () {

        startGame();
    }
);


// =====================================================
// DON'T REMIND ME
// =====================================================

dontRemindBtn.addEventListener(
    "click",
    function () {

        localStorage.setItem(
            "virusGameDontRemind",
            "true"
        );


        startGame();
    }
);


// =====================================================
// RESTART
// =====================================================

document
    .getElementById(
        "restartBtn"
    )
    .addEventListener(
        "click",
        function () {

            gameOverPanel.classList.add(
                "hidden"
            );


            gameStarted = true;


            initializeGame();


            startTimer();


            showMessage(
                "🔄 SYSTEM RESET — NEW SURVIVAL RUN!",
                "#48aaff"
            );


            setTimeout(() => {

                cellEffect(
                    0,
                    0,
                    "gameStartEffect"
                );

            }, 100);
        }
    );


// =====================================================
// EXIT
// =====================================================

document
    .getElementById(
        "exitBtn"
    )
    .addEventListener(
        "click",
        function () {

            clearInterval(
                timerInterval
            );


            gameOverPanel.classList.add(
                "hidden"
            );


            gameStarted = false;


            showMessage(
                "👋 Mission terminated. Thanks for playing!",
                "#8b9aaa"
            );
        }
    );


// =====================================================
// MOBILE SWIPE
// =====================================================

let touchStartX = 0;

let touchStartY = 0;


document.addEventListener(
    "touchstart",
    function (event) {

        touchStartX =
            event.changedTouches[0]
                .screenX;


        touchStartY =
            event.changedTouches[0]
                .screenY;

    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchend",
    function (event) {

        if (
            !gameStarted ||
            gameOverFlag
        ) {

            return;
        }


        const dx =
            event.changedTouches[0]
                .screenX -
            touchStartX;


        const dy =
            event.changedTouches[0]
                .screenY -
            touchStartY;


        if (
            Math.abs(dx) < 30 &&
            Math.abs(dy) < 30
        ) {

            return;
        }


        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            if (
                dx > 0
            ) {

                movePlayer(
                    0,
                    1
                );

            }

            else {

                movePlayer(
                    0,
                    -1
                );
            }

        }

        else {

            if (
                dy > 0
            ) {

                movePlayer(
                    1,
                    0
                );

            }

            else {

                movePlayer(
                    -1,
                    0
                );
            }
        }

    },
    {
        passive: true
    }
);


// =====================================================
// INITIAL UI
// =====================================================

updateUI();