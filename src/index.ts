import os from 'os';
import  cluster from 'cluster';
import Server from './server';

async function run(){
	await Server.loadDatabase();
	Server.loadServer();
}

function runCluster(){
	if (cluster.isPrimary) {
		/**
		 * Find the number of available CPUS
		 */
		const CPUS: any = os.cpus();
	
		/**
		 * Fork the process, the number of times we have CPUs available
		 */
		CPUS.forEach(() => cluster.fork());
	
	} else {
		run();
	}
}

process.env.CLUSTER_MODE 
? runCluster()
: run() 
