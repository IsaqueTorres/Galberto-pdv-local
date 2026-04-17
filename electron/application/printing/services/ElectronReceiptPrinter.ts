import { BrowserWindow } from "electron";
import { logger } from "../../../logger/logger";

export class ElectronReceiptPrinter {
  async printHtml(params: { html: string; printerName: string; title: string; paperWidthMm?: number }) {
    const paperWidthMm = Number(params.paperWidthMm ?? 80);
    const viewportWidthPx = Math.max(360, Math.round((paperWidthMm / 25.4) * 96) + 48);
    const printWindow = new BrowserWindow({
      show: false,
      width: viewportWidthPx,
      height: 1280,
      webPreferences: {
        sandbox: true,
      },
    });

    try {
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(params.html)}`;
      await printWindow.loadURL(dataUrl);

      await new Promise<void>((resolve, reject) => {
        printWindow.webContents.print(
          {
            silent: true,
            printBackground: true,
            deviceName: params.printerName,
            margins: {
              marginType: "none",
            },
          },
          (success, failureReason) => {
            if (!success) {
              reject(new Error(failureReason || "Falha desconhecida na impressão."));
              return;
            }

            resolve();
          },
        );
      });
    } catch (error) {
      logger.error(`[printing] erro ao imprimir "${params.title}": ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      if (!printWindow.isDestroyed()) {
        printWindow.destroy();
      }
    }
  }
}

export const electronReceiptPrinter = new ElectronReceiptPrinter();
