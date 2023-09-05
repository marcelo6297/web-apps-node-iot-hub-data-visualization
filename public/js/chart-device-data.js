/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;
      this.gpsData  = "";
      this.actualizarMapa = false;
      this.timeData = new Array(this.maxLen);
      this.voltajeFR = new Array(this.maxLen);
      this.voltajeFS = new Array(this.maxLen);
      this.voltajeFT = new Array(this.maxLen);
      this.corrienteFR = new Array(this.maxLen);
      this.corrienteFS = new Array(this.maxLen);
      this.corrienteFT = new Array(this.maxLen);
      this.temperaturaData = new Array(this.maxLen);
    }

    addData(time, VFR, VFS, VFT, CFR,CFS,CFT, temperatura,gps) {

      this.timeData.push(time);
      this.voltajeFR.push(VFR);
      this.voltajeFS.push(VFS);
      this.voltajeFT.push(VFT);
      this.corrienteFR.push(CFR);
      this.corrienteFS.push(CFS);
      this.corrienteFT.push(CFT);
      this.temperaturaData.push(temperatura);
      this.actualizarMapa = this.gpsData == gps;
      this.gpsData = gps;
      

      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.voltajeFR.shift();
        this.voltajeFS.shift();
        this.voltajeFT.shift();
        this.corrienteFR.shift();
        this.corrienteFS.shift();
        this.corrienteFT.shift();
        this.temperaturaData.shift();
        
      }
      
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  //mapas
  var features = [];
  var map = new atlas.Map('myMap', {
    center: [-57.6167327,-25.2858589],
    zoom: 14,
    authOptions: {
        authType: "subscriptionKey",
        subscriptionKey: "XXX-XXX-Incluir-Clave-XXX-XXX",

    }
 });

 var source = new atlas.source.DataSource();

 map.events.add('ready', function () {
  
 
  map.sources.add(source);
  map.layers.add(new atlas.layer.BubbleLayer(source));
 
})
 
function updateMapa (gps) {
  //si exite el punto removerlo, si los datos cambiaron agregar nuevos datos
  //remover el punto
  // agregar nuevo punto
 
  
  source.clear();


  if (features.length > 0 ) {
    features.pop();
  }

  features.push(
    new atlas.data.Feature(new atlas.data.Point([parseFloat(gps.lon), parseFloat(gps.lat)]))
  )
  
  source.add(features);

  
  
  map.setCamera({
    center: [gps.lon, gps.lat],
  });

}
 
 
  //Fin Mapa

  const trackedDevices = new TrackedDevices();

  //Charts de V A y T
  const amarillo   = 'rgba(255, 252, 51, 1)';
  const amarillo40 = 'rgba(255, 252, 51, 0.4)';

  const  azul   = 'rgba(24, 120, 240, 1)';
  const  azul40 = 'rgba(24, 120, 240, 0.4)';

  const rojo    = 'rgba(255, 51, 51, 1)';
  const rojo40  = 'rgba(255, 51, 51, 0.4)';

  // Define the chart axes
  const chartData = {
    datasets: [
      {
        fill: false,
        label: 'Voltaje FR (Vac)',
        yAxisID: 'Voltajes',
        borderColor: azul,
        pointBoarderColor: azul,
        backgroundColor: azul40,
        pointHoverBackgroundColor: azul,
        pointHoverBorderColor: azul,
        spanGaps: true,

      }
      ,{
        fill: false,
        label: 'Voltaje FS (Vac)',
        yAxisID: 'Voltajes',
        borderColor: amarillo,
        pointBoarderColor: amarillo,
        backgroundColor: amarillo40,
        pointHoverBackgroundColor: amarillo,
        pointHoverBorderColor: amarillo,
        spanGaps: true,
      },
      {
        fill: false,
        label: 'Voltaje FT (Vac)',
        yAxisID: 'Voltajes',
        borderColor: rojo,
        pointBoarderColor: rojo,
        backgroundColor: rojo40,
        pointHoverBackgroundColor: rojo,
        pointHoverBorderColor: rojo,
        spanGaps: true,
      }
    ]
  };

  const chartOptions = {
      scales: {
        yAxes: [{
          id: 'Voltajes',
          type: 'linear',
          scaleLabel: {
            labelString: 'Voltaje (en KV)',
            display: true,
          },
          position: 'right',
          ticks: {
            suggestedMin: 0,
            suggestedMax: 26,
            beginAtZero: true
          }
        }]
      }
    };
//
 // Define the chart axes para corrientes
 const chartDataCorriente = {
  datasets: [
    {
      fill: false,
      label: 'Corriente FR (Vac)',
      yAxisID: 'Corrientes',
      borderColor: azul,
      pointBoarderColor: azul,
      backgroundColor: azul40,
      pointHoverBackgroundColor: azul,
      pointHoverBorderColor: azul,
      spanGaps: true,

    }
    ,{
      fill: false,
      label: 'Corriente FS (Vac)',
      yAxisID: 'Corrientes',
      borderColor: amarillo,
      pointBoarderColor: amarillo,
      backgroundColor: amarillo40,
      pointHoverBackgroundColor: amarillo,
      pointHoverBorderColor: amarillo,
      spanGaps: true,
    },
    {
      fill: false,
      label: 'Corriente VAC',
      yAxisID: 'Corrientes',
      borderColor: rojo,
      pointBoarderColor: rojo,
      backgroundColor: rojo40,
      pointHoverBackgroundColor: rojo,
      pointHoverBorderColor: rojo,
      spanGaps: true,
    }
  ]
};

const chartOptionsCorriente = {
    scales: {
      yAxes: [{
        id: 'Corrientes',
        type: 'linear',
        scaleLabel: {
          labelString: 'Corriente (en amp)',
          display: true,
        },
        position: 'right',
        ticks: {
          suggestedMin: 0,
          suggestedMax: 26,
          beginAtZero: true
        }
      }]
    }
  };


  //Datos temp
  const chartDataTemp = {
    datasets: [
      {
        fill: false,
        label: 'Temperatura (°C)',
        yAxisID: 'Temperatura',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
    ]
  };


  

  //Opciones del chart de temperatura
  const chartOptionsTemp = {
    scales: {
      yAxes: [{
        id: 'Temperatura',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperatura °C',
          display: true,
        },
        position: 'right',
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100,
          beginAtZero: true
        }
      }
      ]
    }
  };

  // Get the context of the canvas element we want to select

  const voltajeChart = new Chart (
    "iotVoltajes",
    {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });

    const corrienteChart = new Chart(
      "iotCorrientes",
      {
        type: 'line',
        data: chartDataCorriente,
        options: chartOptionsCorriente,
      });

      const temperaturaChart = new Chart(
          "iotTemperatura",
          {
            type: 'line',
            data: chartDataTemp,
            options: chartOptionsTemp,
          });
  
  //Fin de los Charts

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);

    
    
    chartData.labels = device.timeData;

    chartData.datasets[0].data = device.voltajeFR;
    chartData.datasets[1].data = device.voltajeFS;
    chartData.datasets[2].data = device.voltajeFT;

    chartDataCorriente.labels = device.timeData;

    chartDataCorriente.datasets[0].data = device.corrienteFR;
    chartDataCorriente.datasets[1].data = device.corrienteFS;
    chartDataCorriente.datasets[2].data = device.corrienteFT;

    chartDataTemp.labels = device.timeData;
    chartDataTemp.datasets[0].data = device.temperaturaData;
    
    voltajeChart.update();
    corrienteChart.update();
    temperaturaChart.update();

    updateMapa(device.gpsData);

    
  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);


  class UmbralAlert {
  
    constructor(id) {

      $("#msgAlert").hide() ;
      $("#msgNormal").hide();
      
      this.potencia_trafo = 100000;

      this.umbral_vac_min = 198;
      this.umbral_vac_max = 242;

      //umbrales corriente
      this.umbral_amp_max = 0.8 * this.potencia_trafo / (220 * 1.732);

    //umbral de temperatura maxima
      this.umbral_temp_max = 35;
      this.temp_correccion = 30;
    
      this.view = $("#"+id); 
      this.data = {}
    }
    addData = function(data) {
        this.data = data;
    }
    updateView = function() {
      var fallas = [];
    
      if (this.data.voltajeData.FR > this.umbral_vac_max) {
        fallas.push("Sobre Voltaje Fase R");
      } else if (this.data.voltajeData.FR < this.umbral_vac_min) {
        fallas.push("Sub Voltaje Fase R");
      }
    
      if (this.data.voltajeData.FS > this.umbral_vac_max) {
        fallas.push("Sobre Voltaje Fase S");
      } else if (this.data.voltajeData.FS < this.umbral_vac_min) {
        fallas.push("Sub Voltaje Fase S");
      }
    
      if (this.data.voltajeData.FT > this.umbral_vac_max) {
        fallas.push("Sobre Voltaje Fase T");
      } else if (this.data.voltajeData.FT < this.umbral_vac_min) {
        fallas.push("Sub Voltaje Fase T");
      }
    
      if (this.data.corrienteData.FR > this.umbral_amp_max) {
        fallas.push("Sobrecorriente en fase R");
      }
    
      if (this.data.corrienteData.FS > this.umbral_amp_max) {
        fallas.push("Sobrecorriente en fase S");
      }
    
      if (this.data.corrienteData.FT > this.umbral_amp_max) {
        fallas.push("Sobrecorriente en fase T");
      }
    
      if (this.data.temperaturaData > this.umbral_temp_max) {
        fallas.push("Temperatura Muy Alta");
      }
    
      if (fallas.length > 0) {
        $("#msgNormal").hide();
        this.view.text(fallas.join(', '));
        $("#msgAlert").show() ;
      } else {
        $("#msgAlert").hide();
        $("#msgNormal").show();
      }

    }
    
  }

  const umbralAlert = new UmbralAlert("alertas");
  
  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      // time and either temperature or humidity are required
      if (!messageData.MessageDate || (!messageData.IotData.temperaturaData && !messageData.IotData.corrienteData && !messageData.IotData.voltajeData)) {
        return;
      }

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

      if (existingDeviceData) {
        existingDeviceData.addData(messageData.MessageDate.substr(11,8), 
          messageData.IotData.voltajeData.FR,  messageData.IotData.voltajeData.FS,   messageData.IotData.voltajeData.FT,
          messageData.IotData.corrienteData.FR,messageData.IotData.corrienteData.FS, messageData.IotData.corrienteData.FT, 
          messageData.IotData.temperaturaData,
          messageData.IotData.gpsData
          );
        umbralAlert.addData(messageData.IotData);
      } else {
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
        newDeviceData.addData(
          messageData.MessageDate.substr(11,8), 
          messageData.IotData.voltajeData.FR,  messageData.IotData.voltajeData.FS,   messageData.IotData.voltajeData.FT,
          messageData.IotData.corrienteData.FR,messageData.IotData.corrienteData.FS, messageData.IotData.corrienteData.FT, 
          messageData.IotData.temperaturaData,
          messageData.IotData.gpsData
          );
        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(messageData.DeviceId);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);
        //agregar los datos al objeto alerta
        umbralAlert.addData(messageData.IotData);
        // if this is the first device being discovered, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          OnSelectionChange();
        }
      }

      voltajeChart.update();

      corrienteChart.update();

      temperaturaChart.update();

      updateMapa( messageData.IotData.gpsData );
  
      umbralAlert.updateView();

    } catch (err) {
      console.error(err);
    }
  };
});
