declare module "webgazer" {
  export interface WebGazerPrediction {
    x: number;
    y: number;
  }

  export interface WebGazerInstance {
    setRegression(name: string): WebGazerInstance;
    setGazeListener(
      listener: (data: WebGazerPrediction | null, timestamp: number) => void,
    ): WebGazerInstance;
    saveDataAcrossSessions(save: boolean): WebGazerInstance;
    showVideo(show: boolean): WebGazerInstance;
    showFaceOverlay(show: boolean): WebGazerInstance;
    showFaceFeedbackBox(show: boolean): WebGazerInstance;
    showPredictionPoints(show: boolean): WebGazerInstance;
    applyKalmanFilter(apply: boolean): WebGazerInstance;
    begin(): Promise<WebGazerInstance>;
    end(): void;
    pause(): WebGazerInstance;
    resume(): WebGazerInstance;
    clearData(): void;
    recordScreenPosition(x: number, y: number, eventType?: string): void;
    getCurrentPrediction(): Promise<WebGazerPrediction | null>;
    isReady(): boolean;
    params: { faceMeshSolutionPath: string; [key: string]: unknown };
  }

  const webgazer: WebGazerInstance;
  export default webgazer;
}
