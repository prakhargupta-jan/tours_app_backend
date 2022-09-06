module.exports = class APIfeatures {
    excludedFields = ['page', 'sort', 'limit', 'filter', 'fields']
    constructor(findQuery, reqQuery) {
        this.findQuery = findQuery
        this.reqQuery = reqQuery
        this.handledReqQuery =  {...reqQuery}
        this.excludedFields.forEach(el => delete this.handledReqQuery[el])
    }

    filter () {
        this.handledReqQuery = JSON.parse(JSON.stringify(this.handledReqQuery).replace(/\b(gt|gte|lt|lte)\b/g, (el) => `$${el}`))
        this.findQuery.find(this.handledReqQuery);
        return this;
    }
    sort() {
        if (this.reqQuery.sort) {
            this.findQuery.sort(this.reqQuery.sort.split(',').join(' '))
        } else {
            this.findQuery.sort('-createdAt');
        }
        return this;
    }
    fields () {
        if (this.reqQuery.fields) {
            this.findQuery.select(this.reqQuery.fields.split(',').join(' '));
        } else {
            this.findQuery.select('-__v');
        }
        return this;
    }
    paginate () {
        const page = this.reqQuery.page*1 || 1;
        const limit = this.reqQuery.limit*1 || 5;
        this.findQuery.skip((page-1)*limit).limit(limit);
        return this;
    }
}