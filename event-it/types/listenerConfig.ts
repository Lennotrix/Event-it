type ListenerConfig = {
    channel: string;
    schema: string;
    table: string;
    event: "INSERT" | "UPDATE" | "DELETE";
    filter?: string;
    handler: (payload: any) => void;
};