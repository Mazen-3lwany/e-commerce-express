
/**
 * Handle uncaught synchronous exceptions at the process level.
 *
 * These errors happen when a sync exception is thrown and not caught
 * anywhere in the application (often during startup).
 *
 * At this point, the Node.js process is in an unsafe state and cannot
 * reliably continue running.
 *
 * Strategy:
 * 1. Log the error for visibility.
 * 2. Exit the process immediately.
 */
// catch sync crashes first .
process.on("uncaughtException",(err)=>{ 
    console.error("uncaughtd Exception")
    console.error(err.name,err.message)
    process.exit(1)
})
import app from "./src/bootstrap.js";

const port =process.env.Port||3000;
console.log("Port:", port);

const server=app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})

/**
 * Handle unhandled Promise rejections (outside Express lifecycle).
 *
 * These errors happen when a Promise fails without a `.catch()`.
 * At this point, the application may be in an unstable state.
 *
 * Strategy:
 * 1. Log the error for debugging/monitoring.
 * 2. Stop accepting new requests.
 * 3. Finish ongoing requests.
 * 4. Exit the process so a clean restart can happen.
 */
process.on("unhandledRejection",(err)=>{
    console.error("UNHANDLED REJECTIONS")
    console.error(err.name,err.message)
    server.close(()=>{// close system 
        process.exit(1)
    })
})
