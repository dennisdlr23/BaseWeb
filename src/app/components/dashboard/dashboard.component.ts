import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../service/app.config.service';
import { AppConfig } from '../../api/appconfig';

import { Messages } from 'src/app/helpers/messages';
import { DashboardService } from './service/dashboard.service';
import { DocumentosPorTipoContenido } from './models/documentosPorTipoContenido';
import { Chart } from 'chart.js';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  charts = [
    { id: 'chart1', title: 'Minutos Perdidos por Departamento' },
    { id: 'chart2', title: 'Minutos Perdidos por Operación - Causa' },
    { id: 'chart3', title: 'Unidades Perdidas' },
    { id: 'chart4', title: 'Frecuencia de Fallas por Máquina' }
  ];

  chartData1: any;
  chartData2: any;
  chartData3: any;
  chartData4: any;
  chartOptions: any;

  constructor(private dashboardService: DashboardService) { }

  async ngOnInit() {
    try {
      // Obtención de datos desde el servicio
      const [documentosPorTipoContenido] = await Promise.all([
        this.dashboardService.getDocumentosPorTipoContenido() // Obtén los datos para el nuevo gráfico
      ]);

      // Imprimir datos en consola para depuración
      console.log('Documentos por Tipo de Contenido:', documentosPorTipoContenido);


      // Configuración de los datos de los gráficos
      this.chartData1 = this.getChartDataMinutosPorDepartamento(documentosPorTipoContenido);

      // Opciones de los gráficos
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: '#444', // Color del texto
            font: {
              weight: 'bold', // Estilo de fuente en negrita
              size: 12 // Tamaño de fuente
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true
          }
        }
      };

      // Renderizar los gráficos
      this.renderChart('chart1', this.chartData1);

    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }

  getChartDataMinutosPorDepartamento(data: DocumentosPorTipoContenido[]) {
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }
    const labels = data.map(d => d.tipoContenido);
    const values = data.map(d => d.cantidadDocumentos);

    return {
      labels: labels,
      datasets: [{
        label: 'Documentos Por Tipo De Contenido',
        data: values,
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        type: 'bar'
      }]
    };
  }




  renderChart(elementId: string, chartData: any) {
    const ctx = (document.getElementById(elementId) as HTMLCanvasElement)?.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          ...this.chartOptions,
          indexAxis: 'y', // Para gráficos de barras horizontales
          responsive: true,
          maintainAspectRatio: false
        }
      });
    } else {
      console.error(`No se pudo obtener el contexto del canvas con ID: ${elementId}`);
    }
  }
}
