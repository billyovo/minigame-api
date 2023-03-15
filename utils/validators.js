export function isValidNews(body){
    const checkKeys = ["title", "content", "images","publish_date"];
    return Object.keys(body).every(key => checkKeys.includes(key))
}

export function isValidObjectID(id){
    const regex = /^[a-fA-F0-9]{24}$/;
    return regex.test(id);
}

export function isValidMinecraftPlayerName(name){
    const regex = /^[a-zA-Z0-9_]{2,16}$/;
    return regex.test(name);
}