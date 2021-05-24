type Task = () => Promise<void>;

export class TaskQueue {
    private q: Task[] = [];

    public queue(t: Task): void {
        this.q.push(t);
    }
    public get empty(): boolean {
        return this.q.length === 0;
    }
    public pop(): Task | undefined {
        return this.q.shift();
    }
    public peek(): Task | undefined {
        if(this.empty)
            return undefined;
        return this.q[0];
    }
}
