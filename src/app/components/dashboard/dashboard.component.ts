import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../service/app.config.service';
import { AppConfig } from '../../api/appconfig';
import { Messages } from 'src/app/helpers/messages';
import { DashboardService } from './service/dashboard.service';
import { DocumentosPorTipoContenido } from './models/documentosPorTipoContenido';
import { DocumentosPorUsuarios } from './models/documentosPorUsuarios';
import { Chart } from 'chart.js';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  charts = [
    { id: 'chart1', title: 'Documentos por Tipo de Contenido' },
    { id: 'chart2', title: 'Documentos por Usuarios' },
    { id: 'chart3', title: 'Minutos Perdidos por Departamento' },
    { id: 'chart4', title: 'Minutos Perdidos por Operación - Causa' },
    { id: 'chart5', title: 'Unidades Perdidas' },
    { id: 'chart6', title: 'Frecuencia de Fallas por Máquina' }
  ];

  chartData1: any;
  chartData2: any;
  chartOptions: any;

  constructor(private dashboardService: DashboardService) { }

  async ngOnInit() {
    try {
      // Obtención de datos desde el servicio
      const [documentosPorTipoContenido, documentosPorUsuarios] = await Promise.all([
        this.dashboardService.getDocumentosPorTipoContenido(),
        this.dashboardService.getDocumentosPorUsuarios()
      ]);

      // Imprimir datos en consola para depuración
      console.log('Documentos por Tipo de Contenido:', documentosPorTipoContenido);
      console.log('Documentos por Usuarios (antes de procesar):', documentosPorUsuarios);

      // Configuración de los datos de los gráficos
      this.chartData1 = this.getChartDataDocumentosPorTipoContenido(documentosPorTipoContenido);
      this.chartData2 = this.getChartDataDocumentosPorUsuarios(documentosPorUsuarios);

      console.log('Chart Data 1 (Documentos por Tipo):', this.chartData1);
      console.log('Chart Data 2 (Documentos por Usuarios):', this.chartData2);

      // Opciones de los gráficos (personalizadas y profesionales)
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { size: 14 },
              color: '#333',
              boxWidth: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14 },
            bodyFont: { size: 12 },
            padding: 10
          },
          datalabels: {
            color: '#444',
            font: { weight: 'bold', size: 12 },
            formatter: (value: number, ctx: any) => {
              return value > 0 ? value.toFixed(2) : ''; // Mostrar 2 decimales para MB
            },
            align: 'end',
            anchor: 'end'
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Valor', color: '#666', font: { size: 12 } },
            ticks: { color: '#666' },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Usuario', color: '#666', font: { size: 12 } },
            ticks: { color: '#666' },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          }
        }
      };

      // Renderizar los gráficos
      this.renderChart('chart1', this.chartData1);
      this.renderChart('chart2', this.chartData2);

    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }

  getChartDataDocumentosPorTipoContenido(data: DocumentosPorTipoContenido[]) {
    if (!data || data.length === 0) {
      console.warn('No hay datos para Documentos por Tipo de Contenido');
      return { labels: [], datasets: [] };
    }
    const labels = data.map(d => d.tipoContenido);
    const values = data.map(d => d.cantidadDocumentos);

    return {
      labels: labels,
      datasets: [{
        label: 'Documentos por Tipo',
        data: values,
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)', // Azul claro
          'rgba(255, 99, 132, 0.8)', // Rosa
          'rgba(75, 192, 192, 0.8)', // Turquesa
          'rgba(255, 206, 86, 0.8)', // Amarillo
          'rgba(153, 102, 255, 0.8)' // Morado
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
        type: 'bar',
        barPercentage: 0.8,
        categoryPercentage: 0.8
      }]
    };
  }

  getChartDataDocumentosPorUsuarios(data: DocumentosPorUsuarios[]) {
    if (!data || data.length === 0) {
      console.warn('No hay datos para Documentos por Usuarios');
      return { labels: [], datasets: [] };
    }
    const labels = data.map(d => d.userName);
    const cantidadValues = data.map(d => d.cantidadDocumentos);
    const tamanoValues = data.map(d => d.tamanoTotalKB / 1024); // Convertir KB a MB

    console.log('Labels (Usuarios):', labels);
    console.log('Cantidad Documentos:', cantidadValues);
    console.log('Tamaño Total (MB):', tamanoValues);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Cantidad de Documentos',
          data: cantidadValues,
          backgroundColor: 'rgba(54, 162, 235, 0.8)', // Azul claro
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Tamaño Total (MB)',
          data: tamanoValues,
          backgroundColor: 'rgba(255, 99, 132, 0.8)', // Rosa
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  renderChart(elementId: string, chartData: any) {
    console.log(`Renderizando gráfico para el elemento: ${elementId}`);
    const ctx = (document.getElementById(elementId) as HTMLCanvasElement)?.getContext('2d');
    if (ctx) {
      console.log('Contexto del canvas obtenido correctamente');
      const options = {
        ...this.chartOptions,
        indexAxis: 'y', // Barras horizontales
        scales: {
          ...this.chartOptions.scales,
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Valor', color: '#666', font: { size: 12 } },
            ticks: { color: '#666' },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          }
        }
      };

      new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: options
      });
    } else {
      console.error(`No se pudo obtener el contexto del canvas con ID: ${elementId}`);
    }
  }
}
