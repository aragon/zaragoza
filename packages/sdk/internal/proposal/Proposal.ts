import { BigNumberish } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import { EventEmitter } from "eventemitter3";
import Configuration, { ContextConfiguration } from "../context/Context";
import { VOTING } from "../abi/voting/Voting";
import DAO from "../queries/DAO";

export interface Action {
    to: string,
    value: BigNumberish,
    data: string
}

export interface ProposalObject {
    metadata: object,
    actions: Action[],
    executeIfDecided: boolean,
    castVote: boolean;
}

/**
 * @class Proposal
 */
export default class Proposal extends EventEmitter {
    /**
     * Holds the global config that probably got manipulated based on the passed config object in the constructor
     * 
     * @var {Configuration} config
     * 
     * @private
     */
    private config: Configuration;

    /**
     * @param {ProposalObject} proposal All the properties need to submit a proposal.
     * @param {ContextConfiguration} config The optional context config object in case some values of the global one have to be overwritten.
     * 
     * @constructor
     */
    constructor(private proposal: ProposalObject, config?: ContextConfiguration) { 
        super();
        this.config = Configuration.get(config);
     }

    /**
     * Uploads the metadata to IPFS and submits the TX.
     * 
     * @returns {Proposal}
     */
    public create(): Proposal {
        const _this = this;
        
        this.uploadToIpfs(this.proposal.metadata).then(async (cid) => {
            _this.emit('metadataUploaded', cid)

            const tx = await this.config.signer.sendTransaction(
                {
                    to: this.getVotingContract(), 
                    data: this.encodeProposalCreationCall(cid)
                }
            )
            
            _this.emit('done', await tx.wait());
        }).catch((e) => {
            _this.emit('error', e)
        });

        return this;
    }

    /**
     * Encodes the proposal creation call
     * 
     * @param {string} cid The IPFS hash of the uploaded proposal metadata
     * 
     * @private
     * 
     * @returns {string} 
     */
    private encodeProposalCreationCall(cid: string): string {
        return new ethers.utils.Interface(
            VOTING.newVote
        ).encodeFunctionData(
            VOTING.newVote,
            [
                cid,
                this.proposal.actions,
                this.proposal.executeIfDecided,
                this.proposal.castVote
            ]
        );
    }

    /**
     * Encodes the data property of a action as expected.
     * 
     * @method encodeActionData
     * 
     * @param {string} functionSignature 
     * @param {string[]} argTypes 
     * @param {Array<any>} argValues
     *  
     * @returns {string} 
     */
    public static encodeActionData(functionSignature, argTypes, argValues): string {
        return this.getFuncSig(functionSignature) + ethers.utils.defaultAbiCoder.encode(argTypes, argValues);
    }

    /**
     * Returns the function sig (8 bytes of the keccak256 hash created).
     * 
     * @method getFuncSig
     * 
     * @param {string} abiSignature The whole function signature as readable string
     *  
     * @returns 
     */
    public static getFuncSig(abiSignature: string) {
        return ethers.utils.id(
            abiSignature
        ).substring(8);
    }

    /**
     * Private method to upload a arbitray JSON object to IPFS.
     * 
     * @method uploadToIpfs
     * 
     * @param {object} objectToUpload Arbitrary JSON object to upload for the proposal
     * 
     * @private 
     * 
     * @returns {string}
     */
    private async uploadToIpfs(objectToUpload: object): Promise<string> {
        return (await this.config.ipfs.add(JSON.stringify(objectToUpload))).cid.toString();
    }

    /**
     * Returns the address of the voting contract based on the defined DAO of the global config.
     * 
     * @method getVotingContract
     *  
     * @returns {string} The address of the voting contract
     */
    private getVotingContract(): Promise<string> {
        return this.config.subgraph.request(DAO.GET_VOTING_CONTRACT, this.config.dao);
    }
}
