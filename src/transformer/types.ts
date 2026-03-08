export type SummarizeRequest = {
  type: "SUMMARIZE";
  requestId: string;
  text: string;
};

export type WorkerRequest = SummarizeRequest;

export type WorkerResponse = 
    | {
        type: "READY";
    }
    | {
        type: "RESULT";
        requestId: string;
        summary: string;
    }
    | {
        type: "ERROR";
        requestId: string;
        error: string;
    };