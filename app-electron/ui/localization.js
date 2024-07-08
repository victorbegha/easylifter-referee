/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/

const localizationStrings = {
  'en-us': {
    dashboardWindowTitle: 'Dashboard',
    resultsWindowTitle: 'Results',
    miniTimerWindowTitle: 'Timer',

    strRouterDisconnected: 'Router Disconnected',
    strRouterConnected: 'Router Connected',
    strNavDashboard: 'Dashboard',
    strNavConnection: 'Referee Connection',
    strNavSettings: 'Settings',
    strNavHelp: 'Help',
    strTimerTitle: 'Timer',
    strTimerOpenSeparate: 'Open in new window',
    strToggleFullScreen: 'Toggle fullscreen',
    strToggleTimer: 'Show / hide timer',
    strToggleAttempts: 'Show / hide next attempts',
    strNextAttemptTitle: 'Time to inform next attempt:',

    strNetworkIntro: 'Before connecting a referee\'s phone to the system, ensure the EasyLifter router is on and connected to the computer.',
    strNetworkWarning: 'To get connection instructions, connect the EasyLifter router to the computer.',
    strNetworkWifi: '1. In the phone, connect to the system\'s WiFi network:',
    strNetworkSsidLabel: 'Network:',
    strNetworkPasswordLabel: 'Password:',
    strNetworkStayConnected: '2. Since this is a local network, a message like "This network has no internet access, remain connected?" will appear. Choose YES to stay connected. To avoid issues, disable the phone\'s mobile data usage (4g/5g).',
    strNetworkAddress1: '3. Type, in the internet browser, the address "http://easylifter.local/" or',
    strNetworkAddress2: 'to access the system.',

    strLanguageTitle: 'Language',
    strSaveSettings: 'Save settings and restart app',
    strAdvancedOptions: 'Show advanced options',
    strShowDemoValid: 'Demo (valid)',
    strShowDemoInvalid: 'Demo (invalid)',
    strSetAttemptChange: 'New attempt change'
  },
  'pt-br': {
    dashboardWindowTitle: 'Painel',
    resultsWindowTitle: 'Resultados',
    miniTimerWindowTitle: 'Timer',

    strRouterDisconnected: 'Roteador Desconectado',
    strRouterConnected: 'Roteador Conectado',
    strNavDashboard: 'Painel',
    strNavConnection: 'Conexão Árbitros',
    strNavSettings: 'Configurações',
    strNavHelp: 'Ajuda',
    strTimerTitle: 'Timer',
    strTimerOpenSeparate: 'Abrir em janela separada',
    strToggleFullScreen: 'Ativar / desativar tela cheia',
    strToggleTimer: 'Mostrar / ocultar timer',
    strToggleAttempts: 'Mostrar / ocultar próximas pedidas',
    strNextAttemptTitle: 'Tempo para informar próxima pedida:',

    strNetworkIntro: 'Antes de conectar o celular de um árbitro ao sistema, verifique que o roteador EasyLifter está ligado e conectado ao computador.',
    strNetworkWarning: 'Para obter as instruções de conexão, conecte o roteador EasyLifter ao computador.',
    strNetworkWifi: '1. No celular, conecte à rede WiFi do sistema:',
    strNetworkSsidLabel: 'Rede:',
    strNetworkPasswordLabel: 'Senha:',
    strNetworkStayConnected: '2. Como a rede é local, será mostrada uma mensagem como "A rede não tem acesso à internet, permanecer conectado?". Escolha SIM para permanecer conectado. Para evitar problemas, desligue os dados móveis (4g/5g) do celular.',
    strNetworkAddress1: '3. Digite, pelo navegador de internet, o endereço "http://easylifter.local/" ou',
    strNetworkAddress2: 'para acessar o sistema.',


    strLanguageTitle: 'Idioma',
    strSaveSettings: 'Salvar configurações e reiniciar aplicação',
    strAdvancedOptions: 'Mostrar opções avançadas',
    strShowDemoValid: 'Demo (válido)',
    strShowDemoInvalid: 'Demo (inválido)',
    strSetAttemptChange: 'Nova entrega de pedida'
  },
};

function setStrings(language) {
  let languageStrings = localizationStrings[language];

  for (var prop in languageStrings) {
    let element = document.getElementById(prop);
    if (element) {
      element.innerHTML = languageStrings[prop];
    }
  }
}

function setTitle(window, language) {
  let title = localizationStrings[language][window + 'WindowTitle'];
  if (title) {
    document.title = title + ' - EasyLifter Referee';
  }
}

function loadLanguageSettings(language) {
  document.getElementById('langradio' + language).checked = true;
}

module.exports = { setStrings, setTitle, loadLanguageSettings };
