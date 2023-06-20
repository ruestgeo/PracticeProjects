export async function awaitOrTimeout (promise: Promise<any>, delay: number, promiseName?: string){
    const timeout = new Promise((_, reject) => setTimeout( 
        () => reject(new Error(`[${promiseName ?? "<Promise>"}] timed-out after ${Math.round(((delay/1000) + Number.EPSILON) * 100) / 100} seconds`)),
        delay));
    return Promise.race([promise, timeout]);
}