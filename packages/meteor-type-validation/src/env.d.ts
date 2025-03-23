declare global {
    interface PromiseConstructor {
        await?: <T>(promise: T) => Awaited<T>
    }
}

export {}