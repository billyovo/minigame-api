export function isValidNews(body){
    return typeof(body.title) === 'string' &&
           typeof(body.content) === 'string' &&
           Array.isArray(body.images) &&
           typeof(body.publish_date) === 'string' &&
           Object.keys(body).length === 4;
}

export function isValidObjectID(id){
    const regex = /^[a-fA-F0-9]{24}$/;
    return regex.test(id);
}

export function isValidMinecraftPlayerName(name){
    const regex = /^[a-zA-Z0-9_]{2,16}$/;
    return regex.test(name);
}