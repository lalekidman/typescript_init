"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const partners_1 = require("../models/partners");
const queries_1 = require("../utils/queries");
const industry_1 = require("./industry");
const constants_1 = require("../utils/constants");
const helper_1 = require("../utils/helper");
class BusinessPartners extends queries_1.default {
    constructor() {
        super(partners_1.default);
        this.Indus = new industry_1.default();
    }
    formDataValidator(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name = '', avatar, categoryListId, categoryId, industryId } = data;
            return helper_1.formDataValidator([
                {
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: name,
                    fieldName: 'name'
                },
                {
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: categoryId,
                    fieldName: 'categoryId'
                },
                {
                    type: constants_1.FORM_DATA_TYPES.STRING,
                    value: industryId,
                    fieldName: 'industryId'
                }
            ]);
        });
    }
    //@ts-ignore
    save(data) {
        return this.formDataValidator(data)
            .then(() => {
            const { name = '' } = data;
            return partners_1.default
                .findOne({
                name
            })
                .sort({
                _id: 1
            })
                .then((isExist) => __awaiter(this, void 0, void 0, function* () {
                if (isExist) {
                    throw new Error('Business Partner already exist.');
                }
                const newPartner = this.initilize(data);
                const { imageUrl = '' } = yield this.upload(`avatars/${newPartner._id}`, data.avatar);
                if (imageUrl) {
                    newPartner.avatarUrl = imageUrl;
                }
                newPartner.save();
                yield this.updateCategoryCounts(data.industryId);
                return newPartner;
            }));
        });
    }
    updateOne(id, data) {
        return this.formDataValidator(data)
            .then(() => {
            const { name, avatar, industryId, categoryId } = data;
            return partners_1.default
                .findOne({
                _id: {
                    $ne: id.toString().trim()
                },
                name
            })
                .sort({
                _id: 1
            })
                .then((isExist) => __awaiter(this, void 0, void 0, function* () {
                if (isExist) {
                    throw new Error('Business Partner already exist.');
                }
                const partner = yield this.findOne({ _id: id });
                const uploader = yield this.upload(`avatars/${partner._id}`, avatar);
                const oldIndustryId = partner.industryId;
                const oldCategoryId = partner.categoryId;
                partner.set(Object.assign({ name }, data.industryId ? { industryId: data.industryId } : {}, data.categoryId ? { categoryId: data.categoryId } : {}, uploader.imageUrl ? { avatarUrl: uploader.imageUrl } : {}));
                yield partner.save();
                // update the counter to industry model
                this.updateCategoryCounts(partner.industryId);
                return partner;
            }));
        });
    }
    updateCategoryCounts(industryId) {
        return partners_1.default.find({
            industryId: industryId.toString().trim()
        }, {
            industryId: 1,
            categoryId: 1
        })
            .then((partners) => {
            const categoryListCounts = partners.reduce((arr, partner) => {
                const ind = arr.findIndex((a) => a.id === partner.categoryId);
                if (ind === -1) {
                    arr.push({
                        id: partner.categoryId,
                        counts: 1
                    });
                }
                else {
                    arr[ind].counts += 1;
                }
                return arr;
            }, []);
            return this.Indus.updateTotalCounters(industryId, {
                totalPartners: partners.length,
                categoryCounts: categoryListCounts
            });
        });
    }
    viewById(id) {
        return partners_1.default.aggregate([
            {
                $match: {
                    _id: id
                }
            },
            {
                $sort: {
                    name: 1
                }
            },
            {
                $lookup: {
                    from: 'industries',
                    let: {
                        industryId: '$industryId',
                        categoryListId: '$categoryListId',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$industryId']
                                }
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                categoryList: {
                                    $filter: {
                                        input: '$categoryList',
                                        as: 'arr',
                                        cond: {
                                            $eq: ['$$arr._id', '$$categoryListId']
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $unwind: {
                                preserveNullAndEmptyArrays: true,
                                path: '$categoryList'
                            }
                        }
                    ],
                    as: 'industries'
                }
            },
            {
                $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: '$industries'
                }
            }
        ]).then((data) => {
            return data.length >= 1 ? data[0] : {};
        });
    }
    lists(data = {}, sort) {
        let { searchText = '', filterBy } = data;
        return super.aggregateWithPagination([
            {
                $match: Object.assign({
                    name: {
                        $regex: new RegExp(searchText, 'gi')
                    }
                }, filterBy ? { [filterBy.fieldName]: filterBy.value } : {})
            },
            {
                $sort: {
                    name: 1
                }
            },
            {
                $lookup: {
                    from: 'industries',
                    let: {
                        industryId: '$industryId',
                        categoryListId: '$categoryListId',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$industryId']
                                }
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                categoryList: {
                                    $filter: {
                                        input: '$categoryList',
                                        as: 'arr',
                                        cond: {
                                            $eq: ['$$arr._id', '$$categoryListId']
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $unwind: {
                                preserveNullAndEmptyArrays: true,
                                path: '$categoryList'
                            }
                        }
                    ],
                    as: 'industries'
                }
            },
            {
                $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: '$industries'
                }
            },
            {
                $lookup: {
                    from: 'business_branches',
                    let: {
                        businessPartnerId: '$_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$businessPartnerId', '$$businessPartnerId']
                                }
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        },
                        {
                            $group: {
                                _id: '$_id'
                            }
                        }
                    ],
                    as: 'BusinessBranches'
                }
            },
            {
                $addFields: {
                    totalBranches: {
                        $size: '$BusinessBranches'
                    }
                }
            },
            {
                $project: {
                    BusinessBranches: 0
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ['$$ROOT', {
                                industries: {
                                    id: '$industries._id',
                                    name: '$industries.name',
                                    category: '$industries.categoryList',
                                }
                            }]
                    }
                }
            }
        ], data);
    }
}
exports.default = BusinessPartners;
