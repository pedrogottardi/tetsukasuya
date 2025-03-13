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
            <h3>🍪 Utilizamos cookies</h3>
            <p>Este site utiliza cookies e tecnologias semelhantes para melhorar sua experiência, personalizar anúncios e analisar nosso tráfego. Ao clicar em "Aceitar todos", você concorda com o uso de cookies.</p>
            <div class="cookie-consent-buttons">
                <button id="cookie-accept-all" class="cookie-button cookie-accept">Aceitar todos</button>
                <button id="cookie-accept-necessary" class="cookie-button cookie-necessary">Apenas necessários</button>
                <button id="cookie-settings" class="cookie-button cookie-settings">Configurações</button>
            </div>
            <p class="cookie-consent-more-info">Para saber mais, consulte nossa <a href="privacy-policy.html">Política de Privacidade</a>.</p>
        </div>
    `;
    
    // Adicionar o banner ao corpo do documento
    document.body.appendChild(banner);
    
    // Adicionar estilos CSS para o banner
    addConsentStyles();
    
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
        .cookie-consent-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #fff;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            padding: 15px;
            font-family: 'Poppins', sans-serif;
        }
        
        .cookie-consent-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 10px;
        }
        
        .cookie-consent-banner h3 {
            margin: 0 0 10px 0;
            font-size: 1.2rem;
            color: #333;
        }
        
        .cookie-consent-banner p {
            margin: 0 0 15px 0;
            font-size: 0.9rem;
            color: #666;
            line-height: 1.5;
        }
        
        .cookie-consent-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .cookie-button {
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
        }
        
        .cookie-accept {
            background-color: #0066ff;
            color: white;
        }
        
        .cookie-accept:hover {
            background-color: #0055dd;
        }
        
        .cookie-necessary {
            background-color: #f1f1f1;
            color: #333;
        }
        
        .cookie-necessary:hover {
            background-color: #e5e5e5;
        }
        
        .cookie-settings {
            background-color: transparent;
            color: #0066ff;
            border: 1px solid #0066ff;
        }
        
        .cookie-settings:hover {
            background-color: rgba(0, 102, 255, 0.05);
        }
        
        .cookie-consent-more-info {
            font-size: 0.8rem;
            margin-top: 5px;
        }
        
        .cookie-consent-more-info a {
            color: #0066ff;
            text-decoration: none;
        }
        
        .cookie-consent-more-info a:hover {
            text-decoration: underline;
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
            .cookie-consent-buttons {
                flex-direction: column;
            }
            
            .cookie-button {
                width: 100%;
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
        banner.style.display = 'none';
        setTimeout(() => {
            banner.parentNode.removeChild(banner);
        }, 300);
    }
} 