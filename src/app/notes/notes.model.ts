export class Note {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public userID: string,
        public createdDate: Date
        ) {}
}
