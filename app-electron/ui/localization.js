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
    strRouterConnecting: 'Router Connecting...',
    strRouterConnected: 'Router Connected',
    strNavDashboard: 'Dashboard',
    strNavConnection: 'Referee Connection',
    strNavSettings: 'Settings',
    strNavHelp: 'Help',
    strNavAbout: 'About',
    strTimerTitle: 'Timer',
    strTimerOpenSeparate: 'Open in new window',
    strToggleFullScreen: 'Toggle fullscreen',
    strToggleTimer: 'Show / hide timer',
    strToggleAttempts: 'Show / hide next attempts',
    strNextAttemptTitle: 'Time to inform next attempt:',

    strNetworkKitWarning1: 'Network info is only necessary if you need to connect a new device to the system. If you acquired the equipment kit, you should already have three fully configured phones.',
    strNetworkKitWarning2: 'Do not share the network password with anyone. Use this only when setting up a new smartphone for the system.',
    strShowNetworkInfo: 'I understand and wish to access network information',
    strNetworkIntro: 'Before connecting a referee\'s phone to the system, ensure the EasyLifter router is connected to the computer\'s USB port.',
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
    strSetAttemptChange: 'New attempt change',

    strVersion: 'Version',
    strAboutDescription: 'EasyLifter Referee is an open source software licenced under the GNU General Public License v3.',
    strGithubProject: 'Learn more on the project\'s GitHub page.',
    strAboutAuthor: 'Author',
    strAboutThanks: 'Special thanks',
    strAboutNirvana1: 'Nirvana Barbell powerlifting team',
    strAboutNirvana2: ' - for helping test this project and providing valuable feedback.'
  },
  'pt-br': {
    dashboardWindowTitle: 'Painel',
    resultsWindowTitle: 'Resultados',
    miniTimerWindowTitle: 'Timer',

    strRouterDisconnected: 'Roteador Desconectado',
    strRouterConnecting: 'Roteador Conectando...',
    strRouterConnected: 'Roteador Conectado',
    strNavDashboard: 'Painel',
    strNavConnection: 'Conexão Árbitros',
    strNavSettings: 'Configurações',
    strNavHelp: 'Ajuda',
    strNavAbout: 'Sobre',
    strTimerTitle: 'Timer',
    strTimerOpenSeparate: 'Abrir em janela separada',
    strToggleFullScreen: 'Ativar / desativar tela cheia',
    strToggleTimer: 'Mostrar / ocultar timer',
    strToggleAttempts: 'Mostrar / ocultar próximas pedidas',
    strNextAttemptTitle: 'Tempo para informar próxima pedida:',

    strNetworkKitWarning1: 'Os dados da rede são necessários somente se você precisa conectar um novo dispositivo ao sistema. Se você adquiriu o kit do equipamento, já deve possuir três celulares plenamente configurados.',
    strNetworkKitWarning2: 'Não compartilhe a senha da rede com ninguém. Use isto apenas para configurar um novo smartphone para o sistema.',
    strShowNetworkInfo: 'Eu compreendo e desejo acessar os dados da rede',
    strNetworkIntro: 'Antes de conectar o celular de um árbitro ao sistema, verifique que o roteador EasyLifter está conectado à porta USB do computador.',
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
    strSetAttemptChange: 'Nova entrega de pedida',

    strVersion: 'Versão',
    strAboutDescription: 'EasyLifter Referee é um software de código aberto, licenciado sob a GNU General Public License v3.',
    strGithubProject: 'Conheça mais na página GitHub do projeto.',
    strAboutAuthor: 'Autor',
    strAboutThanks: 'Agradecimentos',
    strAboutNirvana1: 'Nirvana Barbell equipe de powerlifting',
    strAboutNirvana2: ' - por ajudar a testar este projeto e prestar feedbacks valiosos.'
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
