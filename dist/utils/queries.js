"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v4");
const aws_1 = require("./aws");
const app_error_1 = require("./app-error");
const s3 = new aws_1.default('kyoo-bucket');
class Queries {
    constructor(mod, Model) {
        this.errorMsg = '';
        if (!mod)
            throw new Error('model is required.');
        this.ModelSchema = mod;
        this.ModelInterface = Model;
    }
    save(data) {
        const collection = this.initilize(data);
        return collection.save();
    }
    initilize(data) {
        const id = uuid();
        return new this.ModelSchema(Object.assign(data, { id, _id: id, createdAt: Date.now(), updatedAt: Date.now() }));
    }
    setErrorMsg(error) {
        return this.errorMsg = error;
    }
    update(id, data) {
        return this.ModelSchema.update({
            id: id
        }, {
            $set: data
        });
    }
    findOne(query = {}, projection = {}) {
        return this.ModelSchema.findOne(query, projection).sort({ _id: 1 }).then((data) => {
            if (data) {
                return data;
            }
            else {
                if (typeof (this.errorMsg) === 'string') {
                    throw new Error('No data found.');
                }
                else {
                    throw new app_error_1.default(this.errorMsg);
                }
            }
        });
    }
    upload(filepath, file) {
        return Promise.resolve(file ? s3.upload(filepath, file) : { imageUrl: '' });
    }
    uploadMany(filepath, files) {
        return Promise.all(files.map((file) => this.upload(filepath, file)));
    }
    /**
     *
     * @param pipeline a pipeline query for aggregation on mongodb
     * @param data for filtering, like limitTo, startAt, sortby etc..
     * @param searchFields2 array of fields that needed to be search or to filter,
     * a function that return a pagination data.
     */
    aggregateWithPagination(pipeline, data, searchFields2 = []) {
        let { limitTo = 0, startAt = 0, sortBy = null, searchFields = [], searchText = '' } = data || {};
        //@ts-ignore
        const endPage = parseInt(limitTo) > 0 ? parseInt(limitTo) : 20;
        //@ts-ignore
        const startPage = parseInt(startAt) > 0 ? parseInt(startAt) : 0;
        //@ts-ignore
        const sortTo = sortBy ? { [sortBy.fieldName]: parseInt(sortBy.status) } : { _id: 1 };
        const q = (searchFields.length >= 1 ? searchFields : searchFields2).map((field) => ({ [field]: {
                $regex: new RegExp(searchText, 'gi')
            } }));
        const paginationQuery = pipeline.concat([
            {
                $match: Object.assign(q.length >= 1 ? {
                    $or: q
                } : {})
            },
            {
                $facet: {
                    data: [
                        {
                            $sort: sortTo
                        },
                        {
                            $skip: startPage
                        },
                        {
                            $limit: endPage
                        }
                    ],
                    totalPages: [
                        {
                            $group: {
                                _id: null,
                                counts: {
                                    $sum: 1
                                }
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    preserveNullAndEmptyArrays: false,
                    path: '$totalPages'
                }
            },
            {
                $project: {
                    _id: 0,
                    data: 1,
                    counts: '$totalPages.counts'
                }
            }
        ]);
        return this.ModelSchema.aggregate(paginationQuery).then((response) => {
            return (response.length >= 1 ? {
                data: response[0].data,
                totalPages: Math.ceil((response[0].counts / endPage)),
                totalCounts: response[0].counts
            } : { data: [], totalPages: 0, totalCounts: 0 });
        });
    }
    setSuspendStatus(id) {
        return this.findOne({ _id: id }, { isSuspended: 1 }).then((mod) => {
            if (mod.isSuspended === undefined) {
                throw new Error('this model is not supported of suspend/unsuspend function.');
            }
            return mod.set({ isSuspended: !mod.isSuspended }).save();
        });
    }
    suspendAccount(id, status) {
        return this.findOne({ _id: id }).then((data) => {
            if (!data.email.status && !data.isVerified) {
                throw new Error('account must be verified before suspending account.');
            }
            return data.set({ status: !data.status }).save();
        });
    }
    get query() {
        return this.ModelSchema;
    }
}
exports.default = Queries;
