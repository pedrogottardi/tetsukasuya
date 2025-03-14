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
        countdownValue: CONSTANTS.COUNTDOWN_TIME
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
        
        // Selecionar cartões padrão inicialmente
        document.querySelector('[data-flavor="standard"]').classList.add('selected');
        document.querySelector('[data-body="standard"]').classList.add('selected');
        
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
                    
                    // Reproduzir som de início (apenas em desktop, em mobile já tocou o beep.mp3)
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    if (!isMobile) {
                        audioElements.startBeep.play();
                    }
                }
            }, 1000);
        }
        
        // Função para iniciar o cronômetro
        function startTimer() {
            // Configurar o tempo de início
            timerState.startTime = Date.now();
            timerState.isRunning = true;
            
            // Atualizar o botão
            startBtn.textContent = 'Pausar';
            startBtn.classList.add('pause');
            
            // Desabilitar os cartões de preferência
            disablePreferenceCards();
            
            // Destacar a seção de passo a passo
            highlightRecipeSection();
            
            // Atualizar o array de passos da receita
            updateRecipeStepsArray();
            
            // Iniciar o intervalo de atualização do cronômetro
            timerState.interval = setInterval(updateTimer, CONSTANTS.TIMER_UPDATE_INTERVAL);
        }
        
        // Adicionar listener para o botão de iniciar/pausar
        startBtn.addEventListener('click', function() {
            // Verificar se o cronômetro está em contagem regressiva
            if (timerState.countdownActive) {
                return; // Não fazer nada se a contagem regressiva estiver ativa
            }
            
            // Verificar se o cronômetro está em execução
            if (!timerState.isRunning) {
                // Verificar se é um dispositivo móvel
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
            elements.currentStep.textContent = 'Pronto para começar';
            elements.nextStep.textContent = 'Primeiro passo: Preparar o filtro';
            timerState.isRunning = false;
            timerState.countdownActive = false;
            timerState.startTime = null;
            timerState.elapsedPausedTime = 0;
            
            // Reabilitar os cartões de preferência
            enablePreferenceCards();
            
            // Remover destaque da seção de passo a passo
            const recipeContainer = document.getElementById('recipe-container');
            recipeContainer.classList.remove('highlighted');
        });
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
        elements.timerDisplay.textContent = formattedTime;
        
        // Atualizar a barra de progresso e os passos
        updateProgressAndSteps(totalSeconds);
    }

    // Função para atualizar o array de passos da receita
    function updateRecipeStepsArray() {
        timerState.recipeSteps = [];
        
        // Começar diretamente com a preparação do filtro (pulando a etapa de pesar o café)
        timerState.recipeSteps.push({ time: 0, text: 'Preparar o filtro e pré-aquecer' });
        
        // Obter os tempos dos ataques de água
        const times = [0, 45, 90, 135, 180, 225]; // em segundos (00:00, 00:45, 01:30, etc.)
        
        // Obter os valores dos ataques de água da receita atual
        const allPours = [];
        document.querySelectorAll('.step-text').forEach(step => {
            if (step.textContent.includes('despeje')) {
                const pourMatch = step.textContent.match(/despeje\s+(\d+)ml/);
                if (pourMatch && pourMatch[1]) {
                    allPours.push(parseInt(pourMatch[1]));
                }
            }
        });
        
        // Calcular o total acumulado para cada despejo
        let totalWater = 0;
        
        // Adicionar os passos de despejo com totais acumulados
        for (let i = 0; i < Math.min(allPours.length, times.length); i++) {
            totalWater += allPours[i];
            timerState.recipeSteps.push({ 
                time: times[i], 
                text: `Despeje ${allPours[i]}ml de água (Total: ${totalWater}ml)` 
            });
        }
        
        // Obter o tempo final da receita
        let finalTime = 255; // Valor padrão (4:15 em segundos)
        
        // Procurar pelo passo final que contém o tempo total
        const allStepTexts = document.querySelectorAll('.step-text');
        const finalStepElement = allStepTexts[allStepTexts.length - 1]; // Pegar o último elemento
        
        if (finalStepElement) {
            console.log("Texto completo do passo final:", finalStepElement.innerHTML);
            
            // Expressão regular para capturar o tempo no formato "aproximadamente <strong>X:XX</strong>"
            const timeMatch = finalStepElement.innerHTML.match(/aproximadamente\s+<strong>([0-9]+):([0-9]+)<\/strong>/);
            
            if (timeMatch && timeMatch[1] !== undefined && timeMatch[2] !== undefined) {
                const minutes = parseInt(timeMatch[1]);
                const seconds = parseInt(timeMatch[2]);
                finalTime = minutes * 60 + seconds;
                console.log(`Tempo final extraído: ${minutes}:${seconds} (${finalTime}s)`);
            } else {
                // Método de fallback: extrair diretamente do texto
                const finalTimeText = finalStepElement.textContent;
                console.log("Texto do passo final (textContent):", finalTimeText);
                
                // Tentar extrair qualquer formato de tempo (X:XX)
                const simpleTimeMatch = finalTimeText.match(/aproximadamente\s+([0-9]+):([0-9]+)/);
                if (simpleTimeMatch && simpleTimeMatch[1] && simpleTimeMatch[2]) {
                    const minutes = parseInt(simpleTimeMatch[1]);
                    const seconds = parseInt(simpleTimeMatch[2]);
                    finalTime = minutes * 60 + seconds;
                    console.log(`Tempo final extraído (texto simples): ${minutes}:${seconds} (${finalTime}s)`);
                } else {
                    // Último recurso: usar o tempo do último ataque + 45 segundos
                    const times = [0, 45, 90, 135, 180, 225];
                    const allPours = document.querySelectorAll('.step-text').length - 2; // -2 para excluir o primeiro e último passos
                    if (allPours > 0 && allPours < times.length) {
                        finalTime = times[allPours] + CONSTANTS.FINAL_STEP_DELAY; // Último ataque + 45 segundos
                        console.log(`Usando tempo calculado: ${Math.floor(finalTime/60)}:${(finalTime%60).toString().padStart(2, '0')} (${finalTime}s)`);
                    } else {
                        console.log("Usando tempo padrão de 4:15 (255s)");
                    }
                }
            }
        } else {
            console.log("Elemento do passo final não encontrado");
        }
        
        // Adicionar passo final
        timerState.recipeSteps.push({ time: finalTime, text: `Café pronto! ☕ (Total: ${totalWater}ml)` });
        
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
            
            // Atualizar exibição do passo atual
            elements.currentStep.textContent = timerState.recipeSteps[currentStepIndex].text;
            
            // Atualizar exibição do próximo passo
            if (nextStepIndex < timerState.recipeSteps.length) {
                const timeUntilNext = timerState.recipeSteps[nextStepIndex].time - totalSeconds;
                elements.nextStep.textContent = `Próximo em ${timeUntilNext}s: ${timerState.recipeSteps[nextStepIndex].text}`;
            } else {
                elements.nextStep.textContent = 'Último passo';
            }
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

    // Iniciar a aplicação
    init();
});