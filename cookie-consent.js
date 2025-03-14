/**
 * Script para gerenciar o consentimento de cookies
 * Compatível com GDPR e LGPD
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário já deu consentimento
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent) {
        // Criar o banner de consentimento
        createConsentBanner();
    }
});

function createConsentBanner() {
    // Criar o elemento do banner
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    
    // Conteúdo do banner
    banner.innerHTML = `
        <div class="cookie-consent-content">
            <h3>🍪 Privacidade e Cookies</h3>
            <p>Usamos cookies para melhorar sua experiência. Escolha suas preferências abaixo.</p>
            <div class="cookie-consent-buttons">
                <button id="cookie-accept-all" class="cookie-button cookie-accept">Aceitar todos</button>
                <button id="cookie-accept-necessary" class="cookie-button cookie-necessary">Apenas essenciais</button>
                <button id="cookie-settings" class="cookie-button cookie-settings">Personalizar</button>
            </div>
            <p class="cookie-consent-more-info">Saiba mais em nossa <a href="privacy-policy.html">Política de Privacidade</a></p>
        </div>
    `;
    
    // Adicionar o banner ao corpo do documento
    document.body.appendChild(banner);
    
    // Adicionar estilos CSS para o banner
    addConsentStyles();
    
    // Verificar tamanho da tela e aplicar opacidade adequada
    function checkScreenSize() {
        // Garantir que a transição seja aplicada antes de mudar a opacidade
        banner.style.transition = "opacity 0.5s ease, transform 0.4s ease, box-shadow 0.4s ease, border 0.4s ease";
        
        if (window.innerWidth <= 768) {
            // Em dispositivos móveis, opacidade total
            banner.style.opacity = '1';
        } else {
            // Em desktop, opacidade reduzida
            banner.style.opacity = '0.6';
        }
    }
    
    // Aplicar verificação inicial
    checkScreenSize();
    
    // Adicionar evento para quando a janela for redimensionada
    window.addEventListener('resize', checkScreenSize);
    
    // Adicionar eventos para hover com transição suave
    banner.addEventListener('mouseenter', function() {
        if (window.innerWidth > 768) {
            // Aumentar a opacidade do banner
            this.style.opacity = '1';
            
            // Aumentar a opacidade dos elementos internos
            const content = this.querySelector('.cookie-consent-content');
            const headings = this.querySelectorAll('h3');
            const paragraphs = this.querySelectorAll('p');
            const buttons = this.querySelectorAll('.cookie-button');
            
            if (content) content.style.opacity = '1';
            
            headings.forEach(heading => {
                heading.style.opacity = '1';
            });
            
            paragraphs.forEach(paragraph => {
                paragraph.style.opacity = '1';
            });
            
            buttons.forEach(button => {
                button.style.opacity = '1';
            });
            
            // Aplicar outros efeitos visuais
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
            this.style.backgroundColor = '#ffffff';
            this.style.border = '1px solid rgba(0, 102, 255, 0.1)';
        }
    });
    
    banner.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
            // Reduzir a opacidade do banner
            this.style.opacity = '0.6';
            
            // Reduzir a opacidade dos elementos internos
            const content = this.querySelector('.cookie-consent-content');
            const headings = this.querySelectorAll('h3');
            const paragraphs = this.querySelectorAll('p');
            const buttons = this.querySelectorAll('.cookie-button');
            
            if (content) content.style.opacity = '0.9';
            
            headings.forEach(heading => {
                heading.style.opacity = '0.85';
            });
            
            paragraphs.forEach(paragraph => {
                paragraph.style.opacity = '0.85';
            });
            
            buttons.forEach(button => {
                button.style.opacity = '0.9';
            });
            
            // Remover outros efeitos visuais
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
            this.style.backgroundColor = '#fff';
            this.style.border = '1px solid transparent';
        }
    });
    
    // Adicionar eventos aos botões
    document.getElementById('cookie-accept-all').addEventListener('click', function() {
        acceptAllCookies();
        hideBanner();
    });
    
    document.getElementById('cookie-accept-necessary').addEventListener('click', function() {
        acceptNecessaryCookies();
        hideBanner();
    });
    
    document.getElementById('cookie-settings').addEventListener('click', function() {
        showCookieSettings();
    });
}

function addConsentStyles() {
    // Criar elemento de estilo
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes slideDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100%);
                opacity: 0;
            }
        }
        
        .cookie-consent-banner {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            margin: 0 auto;
            width: 90%;
            max-width: 600px;
            background-color: #fff;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            padding: 15px;
            font-family: 'Poppins', sans-serif;
            animation: slideUp 0.5s ease-out forwards;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            transition: opacity 0.5s ease, transform 0.4s ease, box-shadow 0.4s ease, border 0.4s ease;
            border: 1px solid transparent;
            /* Não definimos a opacidade aqui, será definida via JavaScript */
        }
        
        .cookie-consent-banner h3 {
            margin: 0 0 5px 0;
            font-size: 1.1rem;
            color: #333;
            text-align: center;
            width: 100%;
        }
        
        .cookie-consent-banner p {
            margin: 0 0 10px 0;
            font-size: 0.85rem;
            color: #666;
            line-height: 1.4;
            text-align: center;
            width: 100%;
        }
        
        .cookie-consent-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px auto;
            justify-content: center;
            width: 100%;
            align-items: center;
        }
        
        .cookie-button {
            padding: 8px 15px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: opacity 0.5s ease, background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            min-width: 110px;
            text-align: center;
            margin: 0 5px;
        }
        
        .cookie-accept {
            background-color: #0066ff;
            color: white;
        }
        
        .cookie-accept:hover {
            background-color: #0055dd;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .cookie-necessary {
            background-color: #f1f1f1;
            color: #333;
        }
        
        .cookie-necessary:hover {
            background-color: #e5e5e5;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .cookie-settings {
            background-color: transparent;
            color: #0066ff;
            border: 1px solid #0066ff;
        }
        
        .cookie-settings:hover {
            background-color: rgba(0, 102, 255, 0.05);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .cookie-consent-more-info {
            font-size: 0.75rem;
            margin-top: 8px;
            text-align: center;
            width: 100%;
        }
        
        .cookie-consent-more-info a {
            color: #0066ff;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .cookie-consent-more-info a:hover {
            text-decoration: underline;
            color: #0055dd;
        }
        
        .cookie-settings-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .cookie-settings-content {
            background-color: white;
            border-radius: 8px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .cookie-settings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .cookie-settings-header h3 {
            margin: 0;
        }
        
        .cookie-settings-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
            width: 24px;
            height: 24px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            transition: color 0.3s ease;
        }
        
        .cookie-settings-close:hover {
            color: #333;
        }
        
        .cookie-settings-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .cookie-settings-option:last-child {
            border-bottom: none;
        }
        
        .cookie-option-info {
            flex: 1;
        }
        
        .cookie-option-info h4 {
            margin: 0 0 5px 0;
            font-size: 1rem;
        }
        
        .cookie-option-info p {
            margin: 0;
            font-size: 0.85rem;
            color: #666;
        }
        
        .cookie-settings-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
            margin-left: 15px;
        }
        
        .cookie-settings-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .cookie-settings-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        
        .cookie-settings-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .cookie-settings-slider {
            background-color: #0066ff;
        }
        
        input:checked + .cookie-settings-slider:before {
            transform: translateX(26px);
        }
        
        .cookie-settings-footer {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        @media (max-width: 768px) {
            .cookie-consent-banner {
                bottom: 10px;
                width: 95%;
                max-width: 95%;
                padding: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                left: 0;
                right: 0;
                margin: 0 auto;
            }
            
            .cookie-consent-content {
                width: 100%;
                max-width: 100%;
            }
            
            .cookie-consent-banner h3 {
                font-size: 0.95rem;
                margin-bottom: 4px;
            }
            
            .cookie-consent-banner p {
                font-size: 0.75rem;
                margin-bottom: 8px;
                line-height: 1.3;
            }
            
            .cookie-consent-buttons {
                flex-direction: column;
                gap: 6px;
                width: 100%;
                margin: 8px auto;
            }
            
            .cookie-button {
                width: 100%;
                padding: 7px;
                font-size: 0.8rem;
                min-width: auto;
            }
            
            .cookie-consent-more-info {
                font-size: 0.65rem;
                margin-top: 6px;
            }
        }
        
        .cookie-consent-content {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        @media (min-width: 769px) {
            .cookie-consent-banner:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                background-color: #ffffff;
                border: 1px solid rgba(0, 102, 255, 0.1);
                /* Não definimos a opacidade aqui, será controlada via JavaScript */
            }
            
            /* Animação de fade para o conteúdo interno */
            .cookie-consent-content {
                opacity: 0.9;
                transition: opacity 0.5s ease;
            }
            
            /* Animação de fade para os textos */
            .cookie-consent-banner h3,
            .cookie-consent-banner p {
                opacity: 0.85;
                transition: opacity 0.5s ease;
            }
            
            /* Animação de fade para os botões - apenas opacidade */
            .cookie-button {
                opacity: 0.9;
                transition: opacity 0.5s ease, background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
            }
        }
    `;
    
    // Adicionar o estilo ao cabeçalho
    document.head.appendChild(style);
}

function showCookieSettings() {
    // Criar o modal de configurações
    const modal = document.createElement('div');
    modal.className = 'cookie-settings-modal';
    
    // Conteúdo do modal
    modal.innerHTML = `
        <div class="cookie-settings-content">
            <div class="cookie-settings-header">
                <h3>Configurações de Cookies</h3>
                <button class="cookie-settings-close">&times;</button>
            </div>
            
            <div class="cookie-settings-options">
                <div class="cookie-settings-option">
                    <div class="cookie-option-info">
                        <h4>Cookies Necessários</h4>
                        <p>Essenciais para o funcionamento básico do site. O site não pode funcionar corretamente sem estes cookies.</p>
                    </div>
                    <label class="cookie-settings-switch">
                        <input type="checkbox" checked disabled>
                        <span class="cookie-settings-slider"></span>
                    </label>
                </div>
                
                <div class="cookie-settings-option">
                    <div class="cookie-option-info">
                        <h4>Cookies de Preferências</h4>
                        <p>Permitem que o site lembre suas escolhas e forneça recursos aprimorados e mais personalizados.</p>
                    </div>
                    <label class="cookie-settings-switch">
                        <input type="checkbox" id="preference-cookies">
                        <span class="cookie-settings-slider"></span>
                    </label>
                </div>
                
                <div class="cookie-settings-option">
                    <div class="cookie-option-info">
                        <h4>Cookies de Estatísticas</h4>
                        <p>Ajudam a entender como os visitantes interagem com o site, coletando e relatando informações anonimamente.</p>
                    </div>
                    <label class="cookie-settings-switch">
                        <input type="checkbox" id="statistics-cookies">
                        <span class="cookie-settings-slider"></span>
                    </label>
                </div>
                
                <div class="cookie-settings-option">
                    <div class="cookie-option-info">
                        <h4>Cookies de Marketing</h4>
                        <p>Utilizados para rastrear visitantes em sites. A intenção é exibir anúncios relevantes e envolventes para o usuário.</p>
                    </div>
                    <label class="cookie-settings-switch">
                        <input type="checkbox" id="marketing-cookies">
                        <span class="cookie-settings-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="cookie-settings-footer">
                <button id="cookie-save-settings" class="cookie-button cookie-accept">Salvar preferências</button>
            </div>
        </div>
    `;
    
    // Adicionar o modal ao corpo do documento
    document.body.appendChild(modal);
    
    // Adicionar eventos aos botões
    document.querySelector('.cookie-settings-close').addEventListener('click', function() {
        closeModal();
    });
    
    document.getElementById('cookie-save-settings').addEventListener('click', function() {
        saveSettings();
        closeModal();
        hideBanner();
    });
    
    // Fechar o modal ao clicar fora dele
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.cookie-settings-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function saveSettings() {
    // Obter as preferências do usuário
    const preferences = {
        necessary: true, // Sempre necessário
        preference: document.getElementById('preference-cookies').checked,
        statistics: document.getElementById('statistics-cookies').checked,
        marketing: document.getElementById('marketing-cookies').checked
    };
    
    // Salvar as preferências no localStorage
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    
    // Aplicar as preferências
    applyCookiePreferences(preferences);
}

function acceptAllCookies() {
    // Aceitar todos os tipos de cookies
    const preferences = {
        necessary: true,
        preference: true,
        statistics: true,
        marketing: true
    };
    
    // Salvar as preferências no localStorage
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    
    // Aplicar as preferências
    applyCookiePreferences(preferences);
}

function acceptNecessaryCookies() {
    // Aceitar apenas cookies necessários
    const preferences = {
        necessary: true,
        preference: false,
        statistics: false,
        marketing: false
    };
    
    // Salvar as preferências no localStorage
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    
    // Aplicar as preferências
    applyCookiePreferences(preferences);
}

function applyCookiePreferences(preferences) {
    // Aqui você pode implementar a lógica para aplicar as preferências de cookies
    // Por exemplo, desativar scripts de rastreamento se o usuário não aceitou cookies de estatísticas
    
    // Se o usuário não aceitou cookies de marketing, desativar o Google AdSense
    if (!preferences.marketing) {
        // Código para desativar scripts de marketing/publicidade
        disableMarketingScripts();
    }
    
    // Se o usuário não aceitou cookies de estatísticas, desativar o Google Analytics
    if (!preferences.statistics) {
        // Código para desativar scripts de análise
        disableAnalyticsScripts();
    }
}

function disableMarketingScripts() {
    // Desativar scripts de marketing/publicidade
    // Este é um exemplo simplificado
    const adScripts = document.querySelectorAll('script[src*="pagead2.googlesyndication.com"]');
    adScripts.forEach(script => {
        script.setAttribute('type', 'text/plain');
    });
    
    // Remover anúncios existentes
    const adContainers = document.querySelectorAll('.ad-container, .footer-ad-container');
    adContainers.forEach(container => {
        container.style.display = 'none';
    });
}

function disableAnalyticsScripts() {
    // Desativar scripts de análise
    // Este é um exemplo simplificado
    const analyticsScripts = document.querySelectorAll('script[src*="google-analytics.com"]');
    analyticsScripts.forEach(script => {
        script.setAttribute('type', 'text/plain');
    });
}

function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
        // Adicionar animação de slide-down
        banner.style.animation = 'slideDown 0.5s ease-out forwards';
        
        // Remover o banner após a animação terminar
        setTimeout(() => {
            banner.parentNode.removeChild(banner);
        }, 500);
    }
} 