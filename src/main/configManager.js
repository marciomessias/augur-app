const {
  SAVE_FAILURE,
  ERROR_NOTIFICATION,
  REQUEST_CONFIG,
  SAVE_CONFIG,
  REQUEST_CONFIG_RESPONSE,
  SAVE_CONFIG_RESPONSE,
  LIGHT_NODE_NAME
} = require('../utils/constants')
const fs = require('fs')
const path = require('path')
const { ipcMain } = require('electron')
const appData = require('app-data-folder')
const log = require('electron-log')
const { merge } = require('lodash')

const defaultConfig = {
  uiPort: '8080',
  sslPort: '8443',
  sslEnabled: false,
  networks: {
    mainnet: {
      userCreated: false,
      http: 'https://eth-mainnet.alchemyapi.io/jsonrpc/7sE1TzCIRIQA3NJPD5wg7YRiVjhxuWAE',
      name: 'Mainnet (powered by Alchemy)',
      selected: true,
      ws: '',
      id: '1'
    },
    localLightNode: {
      userCreated: false,
      http: 'http://127.0.0.1:8545',
      name: LIGHT_NODE_NAME,
      ws: 'ws://127.0.0.1:8546'
    },
    rinkeby: {
      userCreated: false,
      http: 'https://eth-rinkeby.alchemyapi.io/jsonrpc/xWkVwAbM7Qr-p8j-Zu_PPwldZJKmaKjx',
      name: 'Rinkeby',
      ws: '',
      id: '4'
    },
    ropsten: {
      userCreated: false,
      http: 'https://ropsten.augur.net/ethereum-http',
      name: 'Ropsten',
      ws: 'wss://ropsten.augur.net/ethereum-ws',
      id: '3'
    },
    kovan: {
      userCreated: false,
      http: 'https://eth-kovan.alchemyapi.io/jsonrpc/Kd37_uEmJGwU6pYq6jrXaJXXi8u9IoOM',
      name: 'Kovan',
      ws: '',
      id: '42'
    },
    local: {
      userCreated: false,
      http: 'http://127.0.0.1:8545',
      name: 'Local',
      ws: 'ws://127.0.0.1:8546'
    }
  }
}

function ConfigManager() {
  this.appDataPath = appData('augur')
  if (!fs.existsSync(this.appDataPath)) {
    fs.mkdirSync(this.appDataPath)
  }
  this.configPath = path.join(this.appDataPath, 'app.config')
  if (!fs.existsSync(this.configPath)) {
    this.config = JSON.parse(JSON.stringify(defaultConfig))
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4))
  } else {
    this.config = JSON.parse(fs.readFileSync(this.configPath))
    if (this.config.hasOwnProperty('sslEnabled')) {
      delete defaultConfig.sslEnabled
    }
    if (this.config.hasOwnProperty('uiPort')) {
      delete defaultConfig.uiPort
    }
    this.config = merge(this.config, defaultConfig)
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4))
  }

  ipcMain.on(REQUEST_CONFIG, this.onRequestConfig.bind(this))
  ipcMain.on(SAVE_CONFIG, this.onSaveConfig.bind(this))
}

ConfigManager.prototype.getSelectedNetwork = function() {
  let selected = Object.values(this.config.networks).find(n => n.selected)
  if (!selected) selected = Object.values(this.config.networks).find(n => n.name.toLowerCase().indexOf('mainnet') > -1)
  return selected
}

ConfigManager.prototype.isSslEnabled = function() {
  return this.config.sslEnabled
}

ConfigManager.prototype.onRequestConfig = function(event) {
  event.sender.send(REQUEST_CONFIG_RESPONSE, Object.assign(this.config, { dataDir: this.appDataPath }))
}

ConfigManager.prototype.onSaveConfig = function(event, config) {
  try {
    this.config = config
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4))
    event.sender.send(SAVE_CONFIG_RESPONSE, this.config)
  } catch (err) {
    log.error(err)
    event.sender.send(ERROR_NOTIFICATION, {
      messageType: SAVE_FAILURE,
      message: err.message || err
    })
  }
}

module.exports = ConfigManager
