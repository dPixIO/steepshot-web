import dpay from 'dpayjs';
import Constants from '../common/constants';

const MAX_COUNT_TRY = 3;
let currentNode = 0;
const NODE_LIST = Constants.BLOCKCHAIN.dpay.CONNECTION_SERVERS;


class DPayNodeService {

	static initConfig() {
		dpay.api.setOptions({url: NODE_LIST[currentNode]});
	}

	static switchNode() {
		let infoMsg = `switch node from ${NODE_LIST[currentNode]} to `;
		currentNode = (currentNode + 1) % NODE_LIST.length;
		dpay.api.setOptions({url: NODE_LIST[currentNode]});
		infoMsg += NODE_LIST[currentNode];
		console.log(infoMsg);
	}

	constructor() {
		this.countTry = 1;
	}

	setNextNode() {
		this.countTry++;
		DPayNodeService.switchNode();
	}

	isMaxCountRequests() {
		return this.countTry >= MAX_COUNT_TRY;
	}
}

export default DPayNodeService;
