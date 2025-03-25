document.addEventListener('DOMContentLoaded', function() {
    // Cache de elementos DOM frequentemente usados
    const elements = {
        recipeContainer: document.getElementById('recipe-container'),
        coffeeAmount: document.getElementById('coffee-amount'),
        waterAmount: document.getElementById('water-amount'),
        ratio: document.getElementById('ratio'),
        recipeCoffee: document.getElementById('recipe-coffee'),
        recipeWater: document.getElementById('recipe-water'),
        recipeRatio: document.getElementById('recipe-ratio'),
        recipeSteps: document.getElementById('recipe-steps'),
        timerDisplay: document.querySelector('.timer-display'),
        startBtn: document.getElementById('timer-start'),
        resetBtn: document.getElementById('timer-reset'),
        progressBar: document.querySelector('.timer-progress-bar'),
        currentStep: document.querySelector('.current-step'),
        nextStep: document.querySelector('.next-step'),
        recipeDetails: document.querySelector('.recipe-details'),
        recipeInfo: document.querySelector('.recipe-info'),
        timestampsContainer: document.getElementById('timer-timestamps')
    };
    
    // Constantes para evitar "números mágicos" no código
    const CONSTANTS = {
        DEFAULT_COFFEE: 15,
        DEFAULT_RATIO: 15,
        DEFAULT_WATER: 225,
        ANIMATION_DELAY: 300,
        COUNTDOWN_TIME: 3,
        TIMER_UPDATE_INTERVAL: 100,
        FINAL_STEP_DELAY: 45, // 45 segundos após o último despejo
        SOUNDS: {
            COUNTDOWN: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFWgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwBK8AAAAAAAAAABSAJAJAQgAAgAAAA+gZ4JwXAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxBYAE7ABI6AAAIJgCR0AAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
            START: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFWgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwBK8AAAAAAAAAABSAJAJAQgAAgAAAA+gZ4KQXAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxBYAFBABIaAAAIKKAGQ0AAAQVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
        }
    };
    
    // Variáveis de estado do cronômetro
    const timerState = {
        interval: null,
        startTime: null,
        isRunning: false,
        elapsedPausedTime: 0,
        recipeSteps: [],
        countdownActive: false,
        countdownValue: CONSTANTS.COUNTDOWN_TIME,
        hasStarted: false,
        updateInterval: null
    };
    
    // Flag para evitar loops infinitos nas atualizações
    let isUpdating = false;
    
    // Debounce para melhorar performance em eventos frequentes
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // Função melhorada para criar e reproduzir sons em dispositivos móveis
    function setupAudioContext() {
        // Variável para armazenar o contexto de áudio
        let audioContext = null;
        
        // Função para inicializar o contexto de áudio após interação do usuário
        function initAudioContext() {
            if (audioContext) return; // Já inicializado
            
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContext = new AudioContext();
                console.log("Contexto de áudio inicializado com sucesso");
            } catch (e) {
                console.error("Erro ao inicializar contexto de áudio:", e);
            }
        }
        
        // Adicionar listener para inicializar o áudio na primeira interação
        document.addEventListener('click', function initAudioOnFirstClick() {
            initAudioContext();
            document.removeEventListener('click', initAudioOnFirstClick);
        }, { once: true });
        
        // Função para criar um beep simples
        function createBeep(frequency = 800, duration = 100, volume = 0.5) {
            return {
                play: function() {
                    // Verificar se o contexto de áudio está disponível
                    if (!audioContext) {
                        initAudioContext();
                        if (!audioContext) {
                            console.log("Contexto de áudio não disponível");
                            return;
                        }
                    }
                    
                    try {
                        // Verificar se o contexto está suspenso (política de autoplay)
                        if (audioContext.state === 'suspended') {
                            audioContext.resume().then(() => {
                                console.log("Contexto de áudio retomado");
                                playSound();
                            }).catch(e => {
                                console.error("Erro ao retomar contexto de áudio:", e);
                            });
                        } else {
                            playSound();
                        }
                        
                        function playSound() {
                            // Criar novos nós a cada vez que o som é reproduzido
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            
                            oscillator.type = 'sine';
                            oscillator.frequency.value = frequency;
                            gainNode.gain.value = volume;
                            
                            // Programar o início e fim do som
                            oscillator.start();
                            
                            // Diminuir o volume gradualmente para evitar cliques
                            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
                            
                            // Parar o oscilador após a duração especificada
                            setTimeout(() => {
                                try {
                                    oscillator.stop();
                                    oscillator.disconnect();
                                    gainNode.disconnect();
                                } catch (e) {
                                    console.log('Erro ao parar oscilador:', e);
                                }
                            }, duration);
                        }
                    } catch (e) {
                        console.error("Erro ao reproduzir som:", e);
                    }
                }
            };
        }
        
        // Alternativa usando arquivos de áudio para dispositivos móveis
        function createAudioElement(isCountdown) {
            // Criar elemento de áudio com o arquivo apropriado
            const audio = document.createElement('audio');
            
            // Usar o arquivo beep.mp3 da pasta sfx
            audio.src = isCountdown ? 'sfx/beep.mp3' : 'sfx/beep.mp3';
            
            // Configurar para reprodução em dispositivos móveis
            audio.preload = 'auto';
            audio.volume = isCountdown ? 0.3 : 0.5; // Volume mais baixo para contagem regressiva
            
            return {
                play: function() {
                    try {
                        // Clonar o elemento para permitir reproduções sobrepostas
                        const clone = audio.cloneNode();
                        
                        // Reproduzir e remover após a reprodução
                        clone.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
                        clone.onended = function() {
                            if (document.body.contains(clone)) {
                                document.body.removeChild(clone);
                            }
                        };
                        
                        // Adicionar temporariamente ao DOM (necessário em alguns dispositivos móveis)
                        clone.style.display = 'none';
                        document.body.appendChild(clone);
                    } catch (e) {
                        console.error("Erro ao reproduzir áudio:", e);
                    }
                }
            };
        }
        
        // Detectar se é um dispositivo móvel
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Usar a abordagem apropriada com base no dispositivo
        if (isMobile) {
            console.log("Usando método de áudio para dispositivos móveis com arquivo beep.mp3");
            return {
                countdownBeep: createAudioElement(true),
                startBeep: createAudioElement(false)
            };
        } else {
            console.log("Usando método de áudio padrão");
            return {
                countdownBeep: createBeep(800, 100, 0.3),
                startBeep: createBeep(1200, 200, 0.5)
            };
        }
    }

    // Inicializar os sons
    const audioElements = setupAudioContext();
    
    // Inicialização - configurar listeners e estado inicial
    function init() {
        setupPreferenceCards();
        setupInputListeners();
        setupLockButtons();
        setupTimerControls();
        setupResizeObserver();
        setupDarkModeToggle();
        setupMethodExplanationButton();
        
        // Selecionar cartões padrão inicialmente
        document.querySelector('[data-flavor="standard"]').classList.add('selected');
        document.querySelector('[data-body="standard"]').classList.add('selected');
        
        // Inicializar texto do cronômetro
        elements.currentStep.textContent = 'Pronto para começar';
        elements.nextStep.textContent = '';
        elements.progressBar.style.display = 'none';
        elements.timestampsContainer.style.display = 'none';
        
        // Gerar receita inicial
        generateRecipe();
    }
    
    // Configurar cartões de preferência
    function setupPreferenceCards() {
        document.querySelectorAll('.preference-card').forEach(card => {
            card.addEventListener('click', function() {
                // Remover seleção de outros cartões do mesmo grupo
                const isFlavor = card.dataset.flavor !== undefined;
                const selector = isFlavor ? '[data-flavor]' : '[data-body]';
                
                document.querySelectorAll(selector).forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Adicionar seleção ao cartão clicado
                card.classList.add('selected');
                
                // Gerar receita automaticamente ao selecionar uma preferência
                generateRecipe();
            });
        });
    }
    
    // Configurar listeners para inputs
    function setupInputListeners() {
        // Otimizado para usar os elementos em cache
        elements.coffeeAmount.addEventListener('input', updateFromCoffee);
        elements.waterAmount.addEventListener('input', updateFromWater);
        elements.ratio.addEventListener('input', updateFromRatio);
    }
    
    // Funções de atualização otimizadas
    function updateFromCoffee() {
        if (isUpdating) return;
        isUpdating = true;
        
        const coffeeAmount = parseInt(elements.coffeeAmount.value) || CONSTANTS.DEFAULT_COFFEE;
        const ratio = parseInt(elements.ratio.value) || CONSTANTS.DEFAULT_RATIO;
        
        // Atualizar água com base no café e proporção
        const waterAmount = coffeeAmount * ratio;
        elements.waterAmount.value = waterAmount;
        
        isUpdating = false;
        generateRecipe();
    }
    
    function updateFromWater() {
        if (isUpdating) return;
        isUpdating = true;
        
        const waterAmount = parseInt(elements.waterAmount.value) || CONSTANTS.DEFAULT_WATER;
        const ratio = parseInt(elements.ratio.value) || CONSTANTS.DEFAULT_RATIO;
        
        // Atualizar café com base na água e proporção
        const coffeeAmount = Math.round(waterAmount / ratio);
        elements.coffeeAmount.value = coffeeAmount;
        
        isUpdating = false;
        generateRecipe();
    }
    
    function updateFromRatio() {
        if (isUpdating) return;
        isUpdating = true;
        
        const ratio = parseInt(elements.ratio.value) || CONSTANTS.DEFAULT_RATIO;
        const coffeeAmount = parseInt(elements.coffeeAmount.value) || CONSTANTS.DEFAULT_COFFEE;
        
        // Atualizar água com base no café e proporção
        const waterAmount = coffeeAmount * ratio;
        elements.waterAmount.value = waterAmount;
        
        isUpdating = false;
        generateRecipe();
    }
    
    // Função para configurar os botões de bloqueio/desbloqueio
    function setupLockButtons() {
        const waterLockBtn = document.getElementById('water-lock');
        const ratioLockBtn = document.getElementById('ratio-lock');

        if (waterLockBtn) {
            waterLockBtn.addEventListener('click', function() {
                const waterGroup = elements.waterAmount.parentElement.parentElement;
                const isDisabled = waterGroup.classList.contains('disabled');
                
                if (isDisabled) {
                    // Desbloquear campo
                    elements.waterAmount.disabled = false;
                    waterGroup.classList.remove('disabled');
                    this.textContent = "🔓";
                    this.title = "Bloquear campo";
                } else {
                    // Bloquear campo
                    elements.waterAmount.disabled = true;
                    waterGroup.classList.add('disabled');
                    this.textContent = "🔒";
                    this.title = "Desbloquear campo";
                }
            });
        }

        if (ratioLockBtn) {
            ratioLockBtn.addEventListener('click', function() {
                const ratioGroup = elements.ratio.parentElement.parentElement;
                const isDisabled = ratioGroup.classList.contains('disabled');
                
                if (isDisabled) {
                    // Desbloquear campo
                    elements.ratio.disabled = false;
                    ratioGroup.classList.remove('disabled');
                    this.textContent = "🔓";
                    this.title = "Bloquear campo";
                } else {
                    // Bloquear campo
                    elements.ratio.disabled = true;
                    ratioGroup.classList.add('disabled');
                    this.textContent = "🔒";
                    this.title = "Desbloquear campo";
                }
            });
        }
    }
    
    // Função aprimorada para ajustar a altura do recipe-details
    function adjustRecipeDetailsHeight() {
        const recipeDetails = elements.recipeDetails;
        const recipeSteps = elements.recipeSteps;
        
        if (recipeDetails && recipeSteps) {
            // Forçar o cálculo do layout
            recipeDetails.style.height = 'auto';
            
            // Obter a altura real do conteúdo
            const stepsHeight = recipeSteps.scrollHeight;
            const infoHeight = elements.recipeInfo.offsetHeight;
            const padding = 20; // Espaço extra para evitar cortes
            
            // Definir a altura exata
            const totalHeight = stepsHeight + infoHeight + padding;
            recipeDetails.style.height = `${totalHeight}px`;
            
            console.log(`Ajustando altura: steps=${stepsHeight}, info=${infoHeight}, total=${totalHeight}`);
        }
    }

    // Chamar a função após gerar a receita e após um tempo para garantir que as animações terminaram
    function generateRecipe() {
        // Obter valores do formulário
        const coffeeAmount = parseInt(elements.coffeeAmount.value) || CONSTANTS.DEFAULT_COFFEE;
        const waterAmount = parseInt(elements.waterAmount.value) || CONSTANTS.DEFAULT_WATER;
        const ratio = parseInt(elements.ratio.value) || CONSTANTS.DEFAULT_RATIO;
        const flavorPreference = document.querySelector('.preference-card[data-flavor].selected').dataset.flavor;
        const bodyPreference = document.querySelector('.preference-card[data-body].selected').dataset.body;
        
        // Calcular quantidade de água por ataque (aproximadamente 1/5 do total)
        const pourSize = Math.round(waterAmount / 5);
        
        // Criar array com 5 ataques padrão
        let allPours = Array(5).fill(pourSize);
        
        // Ajustar os dois primeiros ataques (40%) com base na preferência de sabor
        if (flavorPreference === 'acidic') {
            // Para mais acidez: primeiro ataque maior
            allPours[0] = Math.round(pourSize * 1.2); // 20% a mais
            allPours[1] = Math.round(pourSize * 0.8); // 20% a menos
        } else if (flavorPreference === 'sweet') {
            // Para mais doçura: segundo ataque maior
            allPours[0] = Math.round(pourSize * 0.8); // 20% a menos
            allPours[1] = Math.round(pourSize * 1.2); // 20% a mais
        }
        
        // Ajustar os três últimos ataques (60%) com base na preferência de corpo
        if (bodyPreference === 'light') {
            // Para menos corpo: dois ataques maiores
            const remainingWater = allPours[2] + allPours[3] + allPours[4];
            allPours[2] = Math.round(remainingWater * 0.5);
            allPours[3] = Math.round(remainingWater * 0.5);
            allPours[4] = 0; // Remover o último ataque
            allPours = allPours.filter(pour => pour > 0); // Remover ataques vazios
        } else if (bodyPreference === 'full') {
            // Para mais corpo: quatro ataques menores
            const remainingWater = allPours[2] + allPours[3] + allPours[4];
            const smallPour = Math.round(remainingWater / 4);
            allPours[2] = smallPour;
            allPours[3] = smallPour;
            allPours[4] = smallPour;
            allPours.push(smallPour); // Adicionar um quarto ataque
        }
        
        // Ajustar o último ataque para garantir que a soma seja igual à quantidade total de água
        const currentTotal = allPours.reduce((sum, pour) => sum + pour, 0);
        const difference = waterAmount - currentTotal;
        
        if (difference !== 0 && allPours.length > 0) {
            allPours[allPours.length - 1] += difference;
        }
        
        // Atualizar os detalhes da receita
        elements.recipeCoffee.textContent = `${coffeeAmount}g`;
        elements.recipeWater.textContent = `${waterAmount}ml`;
        elements.recipeRatio.textContent = `1:${ratio}`;
        
        // Gerar os passos da receita
        elements.recipeSteps.innerHTML = '';
        
        // Passo 1: Pesar café
        const step1 = createStep(1, `Pese <strong>${coffeeAmount}g</strong> de café moído no médio-grosso/grosso.`);
        elements.recipeSteps.appendChild(step1);
        
        // Passo 2: Preparação do filtro
        const step2 = createStep(2, `Coloque o filtro na v60 e enxágue com água quente para remover o gosto de papel e pré-aquecer. Acrescente o café.`);
        elements.recipeSteps.appendChild(step2);
        
        // Passos para as extrações
        let totalWater = 0;
        let stepNumber = 3;
        
        // Definir tempos fixos para cada extração
        const times = ["00:00", "00:45", "01:30", "02:15", "03:00", "03:45"];
        
        allPours.forEach((pour, index) => {
            totalWater += pour;
            
            const timeText = times[index];
            const step = createStep(
                stepNumber++, 
                `Em <strong>${timeText}</strong>, despeje <strong>${pour}ml</strong> de água (total: <strong>${totalWater}ml</strong>).`
            );
            elements.recipeSteps.appendChild(step);
        });
        
        // Calcular o tempo final (45 segundos após o último despejo)
        const lastPourIndex = allPours.length - 1;
        const lastPourTimeStr = times[lastPourIndex] || "00:00";
        
        // Converter o tempo do último despejo para segundos
        const [lastMinStr, lastSecStr] = lastPourTimeStr.split(":");
        const lastMinutes = parseInt(lastMinStr);
        const lastSeconds = parseInt(lastSecStr);
        const lastPourTimeInSeconds = lastMinutes * 60 + lastSeconds;
        
        // Adicionar 45 segundos para o tempo final
        const finalTimeInSeconds = lastPourTimeInSeconds + CONSTANTS.FINAL_STEP_DELAY;
        const finalMinutes = Math.floor(finalTimeInSeconds / 60);
        const finalSeconds = finalTimeInSeconds % 60;
        const finalTimeStr = `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')}`;
        
        // Passo final
        const finalStep = createStep(
            stepNumber,
            `O tempo total de extração deve ser aproximadamente <strong>${finalTimeStr}</strong>. Bom café! ☕`
        );
        elements.recipeSteps.appendChild(finalStep);
        
        // Mostrar o container da receita
        elements.recipeContainer.style.display = 'flex';
        
        // Ajustar a altura imediatamente e novamente após as animações
        adjustRecipeDetailsHeight();
        
        // Ajustar novamente após as animações terminarem
        setTimeout(adjustRecipeDetailsHeight, CONSTANTS.ANIMATION_DELAY);
        setTimeout(adjustRecipeDetailsHeight, CONSTANTS.ANIMATION_DELAY * 2); // Garantia extra
    }

    // Adicionar a função createStep que estava faltando
    function createStep(number, text) {
        const step = document.createElement('div');
        step.className = 'step';
        
        const stepNumber = document.createElement('div');
        stepNumber.className = 'step-number';
        stepNumber.textContent = number;
        
        const stepText = document.createElement('div');
        stepText.className = 'step-text';
        stepText.innerHTML = text; // Usando innerHTML para interpretar as tags HTML
        
        step.appendChild(stepNumber);
        step.appendChild(stepText);
        
        return step;
    }

    // Função para configurar os controles do cronômetro com sons
    function setupTimerControls() {
        const startBtn = elements.startBtn;
        const resetBtn = elements.resetBtn;
        
        // Função para iniciar a contagem regressiva
        function startCountdown() {
            timerState.countdownActive = true;
            timerState.countdownValue = CONSTANTS.COUNTDOWN_TIME;
            
            // Atualizar o display para mostrar a contagem regressiva
            elements.timerDisplay.textContent = timerState.countdownValue.toString();
            
            // Reproduzir som de contagem regressiva
            audioElements.countdownBeep.play();
            
            // Iniciar o intervalo de contagem regressiva
            const countdownInterval = setInterval(() => {
                timerState.countdownValue--;
                
                if (timerState.countdownValue > 0) {
                    // Atualizar o display
                    elements.timerDisplay.textContent = timerState.countdownValue.toString();
                    
                    // Reproduzir som de contagem regressiva
                    audioElements.countdownBeep.play();
                } else {
                    // Contagem regressiva concluída
                    clearInterval(countdownInterval);
                    timerState.countdownActive = false;
                    
                    // Iniciar o cronômetro
                    startTimer();
                    
                    // Reproduzir som de início
                    audioElements.startBeep.play();
                }
            }, 1000);
        }
        
        // Adicionar listener para o botão de iniciar/pausar
        startBtn.addEventListener('click', function() {
            // Verificar se o cronômetro está em contagem regressiva
            if (timerState.countdownActive) {
                return; // Não fazer nada se a contagem regressiva estiver ativa
            }
            
            // Verificar se o cronômetro está em execução
            if (!timerState.isRunning) {
                // Se o cronômetro já foi iniciado e pausado, continuar de onde parou
                if (timerState.startTime !== null && timerState.elapsedPausedTime > 0) {
                    // Continuar de onde parou, sem contagem regressiva
                    timerState.startTime = Date.now() - timerState.elapsedPausedTime;
                    timerState.isRunning = true;
                    
                    // Atualizar o botão
                    startBtn.textContent = 'Pausar';
                    startBtn.classList.add('pause');
                    
                    // Iniciar o intervalo de atualização do cronômetro
                    timerState.interval = setInterval(updateTimer, CONSTANTS.TIMER_UPDATE_INTERVAL);
                } else {
                    // Primeira inicialização - verificar se é um dispositivo móvel
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    
                    // Em dispositivos móveis, tocar o beep.mp3 apenas uma vez no início da contagem regressiva
                    if (isMobile) {
                        // Tocar o som apenas uma vez no início
                        audioElements.startBeep.play();
                        
                        // Iniciar contagem regressiva sem sons adicionais
                        timerState.countdownActive = true;
                        timerState.countdownValue = CONSTANTS.COUNTDOWN_TIME;
                        
                        // Atualizar o display para mostrar a contagem regressiva
                        elements.timerDisplay.textContent = timerState.countdownValue.toString();
                        
                        // Iniciar o intervalo de contagem regressiva sem sons adicionais
                        const countdownInterval = setInterval(() => {
                            timerState.countdownValue--;
                            
                            if (timerState.countdownValue > 0) {
                                // Atualizar o display
                                elements.timerDisplay.textContent = timerState.countdownValue.toString();
                                // Não tocar sons adicionais durante a contagem
                            } else {
                                // Contagem regressiva concluída
                                clearInterval(countdownInterval);
                                timerState.countdownActive = false;
                                
                                // Iniciar o cronômetro
                                startTimer();
                                // Não tocar som adicional ao iniciar
                            }
                        }, 1000);
                    } else {
                        // Em desktop, manter o comportamento original
                        startCountdown();
                    }
                }
            } else {
                // Pausar o cronômetro
                clearInterval(timerState.interval);
                timerState.elapsedPausedTime = Date.now() - timerState.startTime;
                timerState.isRunning = false;
                
                // Atualizar o botão
                startBtn.textContent = 'Continuar';
                startBtn.classList.remove('pause');
            }
        });

        // Função para reiniciar o cronômetro
        resetBtn.addEventListener('click', function() {
            clearInterval(timerState.interval);
            elements.timerDisplay.textContent = '00:00';
            startBtn.textContent = 'Iniciar';
            startBtn.classList.remove('pause');
            startBtn.disabled = false;
            elements.progressBar.style.width = '0%';
            elements.progressBar.style.display = 'none';
            elements.timestampsContainer.style.display = 'none';
            elements.currentStep.textContent = 'Pronto para começar';
            elements.nextStep.textContent = '';
            timerState.isRunning = false;
            timerState.countdownActive = false;
            timerState.startTime = null;
            timerState.elapsedPausedTime = 0;
            timerState.hasStarted = false;
            
            // Reabilitar os cartões de preferência
            enablePreferenceCards();
            
            // Remover destaque da seção de passo a passo
            const recipeContainer = document.getElementById('recipe-container');
            recipeContainer.classList.remove('highlighted');
            
            // Remover destaque de todos os passos
            document.querySelectorAll('.step-text').forEach(step => {
                step.classList.remove('current-recipe-step');
            });
        });
    }

    // Função para iniciar o cronômetro
    function startTimer() {
        if (!timerState.isRunning) {
            if (!timerState.hasStarted) {
                timerState.hasStarted = true;
                timerState.startTime = Date.now();
                timerState.elapsedPausedTime = 0;
                timerState.isRunning = true;
                
                // Mostrar barra de progresso e timestamps
                elements.progressBar.style.display = 'block';
                elements.timestampsContainer.style.display = 'block';
                
                // Atualizar o botão
                elements.startBtn.textContent = 'Pausar';
                elements.startBtn.classList.add('pause');
                
                // Desabilitar os cartões de preferência
                disablePreferenceCards();
                
                // Destacar a seção de passo a passo
                highlightRecipeSection();
                
                // Fazer scroll suave até o timer
                const timerSection = document.querySelector('.timer-section');
                if (timerSection) {
                    timerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                
                // Atualizar o array de passos da receita
                updateRecipeStepsArray();
                
                // Destacar o primeiro passo imediatamente
                highlightRecipeStep(0);
                
                // Atualizar informação do passo atual na interface
                if (timerState.recipeSteps.length > 0) {
                    elements.currentStep.textContent = timerState.recipeSteps[0].text;
                    
                    // Atualizar informação do próximo passo
                    if (timerState.recipeSteps.length > 1) {
                        const timeUntilNext = timerState.recipeSteps[1].time;
                        elements.nextStep.textContent = `Próximo em ${timeUntilNext}s: ${timerState.recipeSteps[1].text}`;
                    } else {
                        elements.nextStep.textContent = '';
                    }
                }
                
                // Iniciar o intervalo de atualização do cronômetro
                timerState.interval = setInterval(updateTimer, CONSTANTS.TIMER_UPDATE_INTERVAL);
            } else if (timerState.elapsedPausedTime > 0) {
                // Se estiver continuando após uma pausa
                timerState.startTime = Date.now() - timerState.elapsedPausedTime;
                timerState.isRunning = true;
                
                // Atualizar o botão
                elements.startBtn.textContent = 'Pausar';
                elements.startBtn.classList.add('pause');
                
                // Iniciar o intervalo de atualização do cronômetro
                timerState.interval = setInterval(updateTimer, CONSTANTS.TIMER_UPDATE_INTERVAL);
            }
        } else {
            pauseTimer();
        }
    }

    // Função para desabilitar os cartões de preferência
    function disablePreferenceCards() {
        const preferenceCards = document.querySelectorAll('.preference-card');
        preferenceCards.forEach(card => {
            card.classList.add('disabled');
            card.style.pointerEvents = 'none';
            card.style.opacity = '0.6';
        });
        
        // Também desabilitar os inputs de café, água e proporção
        document.getElementById('coffee-amount').disabled = true;
        document.getElementById('water-amount').disabled = true;
        document.getElementById('ratio').disabled = true;
        
        // Desabilitar os botões de bloqueio
        const lockButtons = document.querySelectorAll('.lock-button');
        lockButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.6';
        });
    }

    // Função para reabilitar os cartões de preferência
    function enablePreferenceCards() {
        const preferenceCards = document.querySelectorAll('.preference-card');
        preferenceCards.forEach(card => {
            card.classList.remove('disabled');
            card.style.pointerEvents = 'auto';
            card.style.opacity = '1';
        });
        
        // Reabilitar os inputs
        document.getElementById('coffee-amount').disabled = false;
        
        // Reabilitar os botões de bloqueio
        const lockButtons = document.querySelectorAll('.lock-button');
        lockButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
        });
    }

    // Função para destacar a seção de passo a passo
    function highlightRecipeSection() {
        const recipeContainer = document.getElementById('recipe-container');
        recipeContainer.classList.add('highlighted');
        
        // Não rolar automaticamente para a seção de passo a passo em dispositivos móveis
        // Apenas aplicar o destaque visual
    }

    // Função para atualizar o cronômetro
    function updateTimer() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - timerState.startTime;
        
        // Converter para minutos e segundos
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        // Formatar para exibição
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Verificar se o tempo mudou
        if (elements.timerDisplay.textContent !== formattedTime) {
            elements.timerDisplay.textContent = formattedTime;
            
            // Adicionar animação sutil aos números
            elements.timerDisplay.classList.add('timer-update');
            setTimeout(() => {
                elements.timerDisplay.classList.remove('timer-update');
            }, 200);
        }
        
        // Atualizar a barra de progresso e os passos
        updateProgressAndSteps(totalSeconds);
    }

    // Função para atualizar o array de passos da receita
    function updateRecipeStepsArray() {
        timerState.recipeSteps = [];
        
        // Obter os tempos dos ataques de água
        const times = [0, 45, 90, 135, 180, 225]; // em segundos (00:00, 00:45, 01:30, etc.)
        
        // Obter os elementos dos passos da receita que contêm informações sobre despejo
        const pourSteps = [];
        document.querySelectorAll('.step-text').forEach(step => {
            if (step.innerHTML.includes('despeje') || step.innerHTML.includes('Despeje')) {
                pourSteps.push(step);
            }
        });
        
        console.log("Passos de despejo encontrados:", pourSteps.length);
        
        // Calcular o total acumulado para cada despejo
        let totalWater = 0;
        
        // Adicionar os passos de despejo com totais acumulados
        for (let i = 0; i < Math.min(pourSteps.length, times.length); i++) {
            const step = pourSteps[i];
            const pourMatch = step.innerHTML.match(/despeje\s+<strong>(\d+)ml<\/strong>/i);
            
            if (pourMatch && pourMatch[1]) {
                const pourAmount = parseInt(pourMatch[1]);
                totalWater += pourAmount;
                
                console.log(`Adicionando passo: tempo=${times[i]}s, água=${pourAmount}ml, total=${totalWater}ml`);
                
                timerState.recipeSteps.push({ 
                    time: times[i], 
                    text: `Despeje ${pourAmount}ml de água (Total: ${totalWater}ml)` 
                });
            }
        }
        
        // Obter o tempo final da receita
        let finalTime = 255; // Valor padrão (4:15 em segundos)
        
        // Procurar pelo passo final que contém o tempo total
        const allStepTexts = document.querySelectorAll('.step-text');
        const finalStepElement = allStepTexts[allStepTexts.length - 1]; // Pegar o último elemento
        
        if (finalStepElement) {
            // Expressão regular para capturar o tempo no formato "aproximadamente <strong>X:XX</strong>"
            const timeMatch = finalStepElement.innerHTML.match(/aproximadamente\s+<strong>([0-9]+):([0-9]+)<\/strong>/);
            
            if (timeMatch && timeMatch[1] !== undefined && timeMatch[2] !== undefined) {
                const minutes = parseInt(timeMatch[1]);
                const seconds = parseInt(timeMatch[2]);
                finalTime = minutes * 60 + seconds;
                console.log(`Tempo final extraído: ${minutes}:${seconds} (${finalTime}s)`);
            } else {
                console.log("Usando tempo padrão: 4:15 (255s)");
            }
        }
        
        // Adicionar passo final
        timerState.recipeSteps.push({ 
            time: finalTime, 
            text: `Café pronto! ☕ (Total: ${totalWater}ml)` 
        });
        
        console.log("Passos do timer configurados:", timerState.recipeSteps);
        
        // Atualizar os timestamps na barra de progresso
        updateTimestamps(finalTime);
    }

    // Função para atualizar os timestamps na barra de progresso
    function updateTimestamps(totalTime) {
        const timestampsContainer = elements.timestampsContainer;
        timestampsContainer.innerHTML = '';
        
        // Extrair os tempos dos passos da receita
        const stepTimes = timerState.recipeSteps.map(step => step.time);
        
        // Adicionar timestamps para cada passo
        stepTimes.forEach(time => {
            // Calcular a porcentagem da posição
            const percentage = (time / totalTime) * 100;
            
            // Formatar o tempo para exibição (MM:SS)
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Criar o elemento de timestamp
            const timestamp = document.createElement('div');
            timestamp.className = 'timestamp';
            timestamp.style.left = `${percentage}%`;
            timestamp.textContent = formattedTime;
            
            // Adicionar ao container
            timestampsContainer.appendChild(timestamp);
        });
    }

    // Função para atualizar a barra de progresso e os passos atuais
    function updateProgressAndSteps(totalSeconds) {
        // Tempo total estimado para a receita (em segundos)
        const totalRecipeTime = timerState.recipeSteps.length > 0 ? 
            timerState.recipeSteps[timerState.recipeSteps.length - 1].time : 255;
        
        // Calcular progresso
        const progress = Math.min((totalSeconds / totalRecipeTime) * 100, 100);
        elements.progressBar.style.width = `${progress}%`;
        
        // Atualizar o passo atual com base no tempo
        if (timerState.recipeSteps.length > 0) {
            let currentStepIndex = 0;
            let nextStepIndex = 1;
            
            for (let i = 0; i < timerState.recipeSteps.length; i++) {
                if (totalSeconds >= timerState.recipeSteps[i].time) {
                    currentStepIndex = i;
                    nextStepIndex = i + 1;
                } else {
                    break;
                }
            }
            
            // Verificar se o passo mudou
            const currentStepText = timerState.recipeSteps[currentStepIndex].text;
            const currentStepElement = elements.currentStep;
            
            // Se o texto do passo atual for diferente do que está sendo exibido, aplicar a animação
            if (currentStepElement.textContent !== currentStepText) {
                // Atualizar o texto do passo atual
                currentStepElement.textContent = currentStepText;
                
                // Adicionar a classe para a animação
                currentStepElement.classList.add('step-changed');
                
                // Remover a classe após a animação terminar
                setTimeout(() => {
                    currentStepElement.classList.remove('step-changed');
                }, 1500);
                
                // Destacar o passo correspondente na seção de passo a passo
                highlightRecipeStep(currentStepIndex);
            }
            
            // Atualizar exibição do próximo passo
            if (nextStepIndex < timerState.recipeSteps.length) {
                const timeUntilNext = timerState.recipeSteps[nextStepIndex].time - totalSeconds;
                elements.nextStep.textContent = `Próximo em ${timeUntilNext}s: ${timerState.recipeSteps[nextStepIndex].text}`;
            } else {
                elements.nextStep.textContent = 'Último passo';
            }
        }
    }
    
    // Função para destacar o passo atual na seção de passo a passo
    function highlightRecipeStep(currentStepIndex) {
        // Remover destaque de todos os passos
        document.querySelectorAll('.step-text').forEach(step => {
            step.classList.remove('current-recipe-step');
        });
        
        // Obter todos os elementos de passos
        const stepElements = document.querySelectorAll('.step-text');
        
        // Mapear corretamente o índice do passo do timer para o índice na seção de passo a passo
        let targetStepIndex = -1;
        
        // Corrigir a lógica de mapeamento para garantir que o passo correto seja destacado
        if (currentStepIndex === 0) {
            // Primeiro passo do timer (primeiro despejo em 00:00)
            for (let i = 0; i < stepElements.length; i++) {
                if (stepElements[i].innerHTML.includes('Em <strong>00:00</strong>') || 
                    (stepElements[i].textContent.includes('Em 00:00') && stepElements[i].textContent.includes('despeje'))) {
                    targetStepIndex = i;
                    break;
                }
            }
        } 
        else if (currentStepIndex === timerState.recipeSteps.length - 1) {
            // Último passo (Café pronto)
            targetStepIndex = stepElements.length - 1;
        } 
        else {
            // Passos intermediários (despejos)
            const timeStrings = ["00:00", "00:45", "01:30", "02:15", "03:00", "03:45"];
            // Usar diretamente o índice atual para buscar o tempo correspondente
            const timeToFind = timeStrings[currentStepIndex] || "00:00";
            
            for (let i = 0; i < stepElements.length; i++) {
                // Buscar pelo HTML para considerar as tags strong
                if (stepElements[i].innerHTML.includes(`Em <strong>${timeToFind}</strong>`)) {
                    targetStepIndex = i;
                    break;
                }
            }
        }
        
        // Se ainda não encontrou, tente uma busca mais ampla
        if (targetStepIndex === -1 && currentStepIndex > 0) {
            // Procurar por qualquer passo que inclua "despeje"
            for (let i = 0; i < stepElements.length; i++) {
                if (stepElements[i].textContent.includes('despeje')) {
                    // Pegar o último encontrado para índices maiores
                    targetStepIndex = i;
                    // Para índices intermediários, não quebrar o loop para encontrar o último
                    if (currentStepIndex === timerState.recipeSteps.length - 2) break;
                }
            }
        }
        
        // Verificar se encontramos um passo válido
        if (targetStepIndex >= 0 && targetStepIndex < stepElements.length) {
            // Resetar qualquer animação existente
            const targetElement = stepElements[targetStepIndex];
            targetElement.style.animation = 'none';
            
            // Forçar um reflow para reiniciar a animação
            void targetElement.offsetWidth;
            
            // Limpar o estilo inline e adicionar a classe para animação
            targetElement.style.animation = '';
            targetElement.style.opacity = '1';
            targetElement.classList.add('current-recipe-step');
            
            // Rolar para o passo destacado se estiver fora da área visível
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            console.log("Passo destacado:", targetStepIndex, "Texto:", targetElement.textContent);
        } else {
            console.log("Não foi possível encontrar um passo correspondente para o índice:", currentStepIndex);
        }
    }

    // Função para configurar o observer de redimensionamento
    function setupResizeObserver() {
        // Usar ResizeObserver para detectar mudanças de tamanho nos elementos
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(debounce(() => {
                adjustRecipeDetailsHeight();
            }, 100));
            
            // Observar o container da receita
            if (elements.recipeContainer) {
                resizeObserver.observe(elements.recipeContainer);
            }
        } else {
            // Fallback para navegadores que não suportam ResizeObserver
            window.addEventListener('resize', debounce(adjustRecipeDetailsHeight, 100));
        }
    }

    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', adjustRecipeDetailsHeight);

    // Adicionar um MutationObserver para detectar mudanças no conteúdo
    const recipeStepsObserver = new MutationObserver(function(mutations) {
        adjustRecipeDetailsHeight();
    });

    // Iniciar a observação após o carregamento do DOM
    if (elements.recipeSteps) {
        recipeStepsObserver.observe(elements.recipeSteps, { 
            childList: true, 
            subtree: true,
            characterData: true 
        });
    }

    // Função para alternar entre modo claro e escuro
    function setupDarkModeToggle() {
        const darkModeToggle = document.createElement('button');
        darkModeToggle.className = 'dark-mode-toggle';
        darkModeToggle.setAttribute('aria-label', 'Alternar modo escuro');
        document.body.appendChild(darkModeToggle);

        // Verifica se há preferência salva
        const darkModeSaved = localStorage.getItem('darkMode') === 'true';
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Aplica o modo escuro se estiver salvo ou se o sistema preferir
        if (darkModeSaved || (prefersDarkMode && localStorage.getItem('darkMode') === null)) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        }

        darkModeToggle.addEventListener('click', () => {
            document.body.classList.add('mode-transition');
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            
            setTimeout(() => {
                document.body.classList.remove('mode-transition');
            }, 500);
        });
    }
    
    // Adicionar estilos CSS para animação de entrada/saída dos passos
    function addAdditionalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .step-text {
                transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease;
            }
            
            .step-text.current-recipe-step {
                animation: stepHighlight 1.5s ease;
                animation-fill-mode: forwards;
            }
            
            @keyframes stepEnter {
                from {
                    opacity: 0;
                    transform: translateX(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateX(5px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Adicionar os estilos adicionais
    addAdditionalStyles();

    // Função para configurar o botão de explicação do método
    function setupMethodExplanationButton() {
        const explanationBtn = document.querySelector('.method-explanation-btn');
        
        if (explanationBtn) {
            explanationBtn.addEventListener('click', function() {
                showMethodExplanation();
            });
        }
    }

    // Função para exibir a explicação do método
    function showMethodExplanation() {
        // Texto de explicação do método
        const explanationText = `
            <div class="tetsu-photo-container">
                <img src="images/tetsu-kasuya.jpg" alt="Tetsu Kasuya" class="tetsu-photo">
            </div>
            
            <h3>Tetsu Kasuya</h3>
            <p>Barista japonês, campeão mundial de Brewers Cup em 2016. Criou o método 4:6, uma técnica que permite controlar precisamente o sabor do café dividindo a água em porções estratégicas.</p>
            
            <h4>Por que "4:6"?</h4>
            <p>O nome se refere à divisão da água utilizada na receita: <strong>40%</strong> controlam o sabor <em>(acidez e doçura)</em> e <strong>60%</strong> controlam o corpo do café.</p>
            
            <div class="ratio-visualization">
                <div class="ratio-part-4">40% Sabor</div>
                <div class="ratio-part-6">60% Corpo</div>
            </div>
            <div class="ratio-labels">
                <span>Primeiros 2 despejamentos</span>
                <span>Despejamentos restantes</span>
            </div>
            
            <div class="ratio-buttons">
                <div class="ratio-section">
                    <div class="ratio-btn-group">
                        <button class="ratio-btn ratio-balanced" data-type="balanced" data-category="reset">Padrão</button>
                        <button class="ratio-btn ratio-acidic" data-type="acidic" data-category="flavor">Mais ácido</button>
                        <button class="ratio-btn ratio-sweet" data-type="sweet" data-category="flavor">Mais doce</button>
                    </div>
                </div>
                <div class="ratio-section">
                    <div class="ratio-btn-group">
                        <button class="ratio-btn ratio-full" data-type="full" data-category="body">Mais corpo</button>
                        <button class="ratio-btn ratio-light" data-type="light" data-category="body">Menos corpo</button>
                    </div>
                </div>
            </div>
            
            <div class="ratio-details">
                <p class="ratio-description">
                    <strong>Configuração equilibrada:</strong> Ataques iguais para acidez e doçura balanceadas, com três porções iguais para corpo moderado.
                </p>
            </div>
        
            <div class="tips-section">
                <h4>Dicas para o melhor preparo:</h4>
                <ul>
                    <li><strong>Equipamento:</strong> Ideal para Hario v60 ou métodos similares.</li>
                    <li><strong>Café:</strong> Use grãos frescos moídos na hora, moagem média-grossa/grossa.</li>
                    <li><strong>Água:</strong> 92-96°C, utilize chaleira com bico de ganso para controle preciso do fluxo.</li>
                    <li><strong>Ataques:</strong> Movimentos circulares suaves.</li>
                    <li><strong>Tempo:</strong> Respeite os intervalos entre os ataques para extração ideal.</li>
                    <li><strong>Filtro:</strong> Pré-enxágue o filtro com água quente para remover gosto de papel.</li>
                </ul>
            </div>
        `;
        
        // Criar o modal
        const modal = document.createElement('div');
        modal.className = 'method-explanation-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'method-explanation-modal-content';
        modalContent.innerHTML = explanationText;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'method-explanation-modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        modalContent.prepend(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Adicionar interatividade aos botões de proporção
        setupRatioButtons(modal);
        
        // Fechar o modal ao clicar fora dele
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Função para configurar os botões de proporção interativos
    function setupRatioButtons(modal) {
        const ratioButtons = modal.querySelectorAll('.ratio-btn');
        const ratioPart4 = modal.querySelector('.ratio-part-4');
        const ratioPart6 = modal.querySelector('.ratio-part-6');
        const ratioDescription = modal.querySelector('.ratio-description');
        const ratioLabels = modal.querySelector('.ratio-labels');
        
        // Armazenar as escolhas do usuário
        const userChoices = {
            flavor: null, // acidic, sweet, balanced ou null para padrão
            body: null    // full, light ou null para padrão
        };
        
        // Configurações para cada tipo de sabor (primeiros 40%)
        const flavorConfigs = {
            'balanced': {
                firstPour: 20,
                secondPour: 20,
                desc: 'Ataques iguais para acidez e doçura balanceadas'
            },
            'acidic': {
                firstPour: 24,
                secondPour: 16,
                desc: 'Primeiro ataque maior que o segundo, destacando as notas ácidas'
            },
            'sweet': {
                firstPour: 16, 
                secondPour: 24,
                desc: 'Segundo ataque maior que o primeiro, realçando a doçura'
            },
            'default': {
                firstPour: 20,
                secondPour: 20,
                desc: 'Ataques iguais (configuração padrão)'
            }
        };
        
        // Configurações para cada tipo de corpo (últimos 60%)
        const bodyConfigs = {
            'standard': {
                bodySplit: 3,
                desc: 'Três ataques para corpo equilibrado'
            },
            'full': {
                bodySplit: 4,
                desc: 'Quatro ataques menores para maior corpo'
            },
            'light': {
                bodySplit: 2,
                desc: 'Dois ataques para corpo mais leve'
            },
            'default': {
                bodySplit: 3,
                desc: 'Três ataques iguais (configuração padrão)'
            }
        };

        // Função para resetar as seleções
        function resetSelections() {
            // Remover classe ativa de todos os botões
            ratioButtons.forEach(btn => {
                if (btn.getAttribute('data-category') !== 'reset') {
                    btn.classList.remove('active');
                }
            });
            
            // Resetar as escolhas do usuário
            userChoices.flavor = null;
            userChoices.body = null;
            
            // Atualizar o botão de reset para ficar ativo
            const resetButton = modal.querySelector('.ratio-btn[data-category="reset"]');
            if (resetButton) {
                resetButton.classList.add('active');
            }
            
            // Atualizar a visualização para o padrão
            updateRatioVisualization();
        }
        
        // Função para atualizar a visualização com base nas escolhas do usuário
        function updateRatioVisualization() {
            // Usar configurações padrão se nenhuma escolha foi feita
            const flavorConfig = userChoices.flavor ? flavorConfigs[userChoices.flavor] : flavorConfigs.default;
            const bodyConfig = userChoices.body ? bodyConfigs[userChoices.body] : bodyConfigs.default;
            
            // Atualizar a proporção visual dos primeiros 40% (sabor)
            const firstRatio = flavorConfig.firstPour / (flavorConfig.firstPour + flavorConfig.secondPour);
            
            // Criar divisões dentro dos primeiros 40%
            ratioPart4.innerHTML = `<div style="width:${firstRatio * 100}%; height:100%; display:flex; align-items:center; justify-content:center; background-color:rgba(var(--primary-rgb), 0.8);">${flavorConfig.firstPour}%</div>
            <div style="width:${(1-firstRatio) * 100}%; height:100%; display:flex; align-items:center; justify-content:center;">${flavorConfig.secondPour}%</div>`;
            
            // Criar divisões para o corpo (60%)
            let bodySections = '';
            const sectionWidth = 100 / bodyConfig.bodySplit;
            const sectionPercent = Math.round(60 / bodyConfig.bodySplit);
            
            for (let i = 0; i < bodyConfig.bodySplit; i++) {
                const sectionOpacity = 0.5 + (i * 0.5 / bodyConfig.bodySplit);
                bodySections += `<div style="width:${sectionWidth}%; height:100%; display:flex; align-items:center; justify-content:center; background-color:rgba(var(--primary-rgb), ${sectionOpacity});">${sectionPercent}%</div>`;
            }
            
            ratioPart6.innerHTML = bodySections;
            
            // Padronizar o ratio-labels quando no modo padrão
            if (!userChoices.flavor && !userChoices.body) {
                ratioLabels.innerHTML = '<span>Primeiros 2 ataques</span><span>Ataques restantes</span>';
                ratioDescription.innerHTML = '<strong>Configuração padrão:</strong> Ataques iguais para equilíbrio entre acidez e doçura, com três ataques finais para corpo moderado.';
                return;
            }
            
            // Atualizar as etiquetas para modos específicos
            let labelText = '';
            if (bodyConfig.bodySplit === 2) {
                labelText = '<span>Primeiros 2 ataques</span><span>Apenas 2 ataques finais</span>';
            } else if (bodyConfig.bodySplit === 4) {
                labelText = '<span>Primeiros 2 ataques</span><span>4 ataques menores</span>';
            } else {
                labelText = '<span>Primeiros 2 ataques</span><span>3 ataques finais</span>';
            }
            ratioLabels.innerHTML = labelText;
            
            // Atualizar a descrição combinando as escolhas de sabor e corpo
            let flavorText = userChoices.flavor ? 
                (userChoices.flavor === 'acidic' ? 'Mais acidez' : 
                 userChoices.flavor === 'sweet' ? 'Mais doçura' : 'Equilíbrio') : 'Equilíbrio';
                
            let bodyText = userChoices.body ? 
                (userChoices.body === 'full' ? 'mais corpo' : 
                 userChoices.body === 'light' ? 'menos corpo' : 'corpo moderado') : 'corpo moderado';
            
            ratioDescription.innerHTML = `<strong>${flavorText}</strong> com <strong>${bodyText}</strong>: ${flavorConfig.desc}, ${bodyConfig.desc.toLowerCase()}.`;
        }
        
        // Adicionar listeners de eventos aos botões
        ratioButtons.forEach(button => {
            button.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                const category = this.getAttribute('data-category');
                
                if (!type || !category) return;
                
                // Se for o botão de reset
                if (category === 'reset') {
                    resetSelections();
                    return;
                }
                
                // Remover classe active do botão de reset
                const resetButton = modal.querySelector('.ratio-btn[data-category="reset"]');
                if (resetButton) {
                    resetButton.classList.remove('active');
                }
                
                // Remover classe ativa apenas dos botões da mesma categoria
                modal.querySelectorAll(`.ratio-btn[data-category="${category}"]`).forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Adicionar classe ativa ao botão clicado
                this.classList.add('active');
                
                // Atualizar as escolhas do usuário
                if (category === 'flavor') {
                    userChoices.flavor = type;
                } else if (category === 'body') {
                    userChoices.body = type;
                }
                
                // Atualizar a visualização
                updateRatioVisualization();
            });
        });
        
        // Inicializar com a configuração padrão (resetada)
        resetSelections();
    }

    // Iniciar a aplicação
    init();
});