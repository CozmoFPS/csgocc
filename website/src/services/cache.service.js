const expirationCheckInterval = 10000;
let cache = {};

function getCache({ key, identifier }){
    identifier = String(identifier)
    let object = cache[key];
    let final = object ? object[identifier] : undefined;
    if(final != undefined && final.revivalTime){
        final.expires = Date.now() + final.revivalTime;
        object[identifier] = final;
    }
    return final;
}

function setCache({ key, identifier, value, expires=10000, revivalTime }){
    if(!cache[key]){
        cache[key] = {};
    }

    cache[key][String(identifier)] = {
        value,
        expires: Date.now() + expires,
        revivalTime
    };
}

function cacheExpirationEnforcer(){
    // console.log("Cache expiration enforcement starting")
    const now = Date.now()

    for(let [key, object] of Object.entries(cache)){
        let valueCount = 0;
        let expiredValueCount = 0;

        for(let [identifier, data] of Object.entries(object)){
            valueCount += 1;
            if(data.expires < now){
                delete object[identifier]
                expiredValueCount += 1;
            }
        }

        if(valueCount == expiredValueCount){
            delete cache[key];
        }
    }

    // console.log("Cache expiration enforcement done in: ", Date.now() - now, "ms")
    setTimeout(cacheExpirationEnforcer, expirationCheckInterval);
}

cacheExpirationEnforcer()

/*
const stressTestMaxItems = 797161;
const stressTestDelay = 500;
let stressTestTotal = 0;
let stressTestLastRepliesID;

function cacheStressTest(items=3){
    if(stressTestMaxItems < items){
        console.log("Adding one item at max stress test capacity...")
        let mstNow = Date.now()
        setCache({
            id: String(Math.floor(Math.random() * 99999999999)),
            creatorSteamId: "76838276592766356",
            steamId: "76838276592766356",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent mattis ex ut augue convallis tempor. Morbi ut quam eu sem vulputate ullamcorper vel nec tortor. Fusce tortor ipsum, rutrum ut porttitor eu, dictum vitae sem. Maecenas ullamcorper fringilla enim, vehicula consequat lectus maximus egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis fringilla mauris at metus elementum, sed viverra dui maximus. In fermentum condimentum mi, vitae bibendum turpi",
            status: 'visible',
            sentiment: 'positive',
            imageIDs: ["c85729679258","c85729679258","c85729679258","c85729679258","c85729679258"],
            videoIDs: ["c85729679258"]
        });
        console.log("Done adding item in ", Date.now() - mstNow, "ms")
        
        console.log("Getting very last replies item...")
        let vlrsNow = Date.now();
        let lastRepliesItem = getCache({
            key: "stReplies",
            identifier: stressTestLastRepliesID
        })
        console.log("Result: ", lastRepliesItem);
        console.log("Found in: ", Date.now() - vlrsNow, "ms")

        cacheExpirationEnforcer()

        return;
    }

    items += (items % 3);

    let div = items / 3;

    // profile data
    for(let i = 0; i < div; i++){
        let mockProfileData = {
            steamData: {
                nickname: "12345678901234567890123456789012",
                avatarURL: "https://avatars.steamstatic.com/278c8df6219fcb440b61ae32e3d87797ee2f5529_full.jpg"
            },
            id: String(Math.floor(Math.random() * 99999999999)),
            sentNotes: {
                notes: [
                    1,2,3,4,5,6,7,8,9,0,
                    1,2,3,4,5,6,7,8,9,0,
                    1,2,3,4,5,6,7,8,9,0,
                    1,2,3,4,5,6,7,8,9,0,
                ],
                positive: 20,
                negative: 20
            },
            receivedNotes: {
                notes: [
                    1,2,3,4,5,6,7,8,9,0,
                    1,2,3,4,5,6,7,8,9,0,
                    1,2,3,4,5,6,7,8,9,0,
                    1,2,3,4,5,6,7,8,9,0,
                ],
                positive: 20,
                negative: 20
            },
        }

        setCache({
            key: "stProfiles",
            identifier: mockProfileData.id,
            value: mockProfileData,
            expires: 0
        })
    }

    // note data
    for(let i = 0; i < div; i++){
        let mockNoteData = {
            id: String(Math.floor(Math.random() * 99999999999)),
            creatorSteamId: "76838276592766356",
            steamId: "76838276592766356",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent mattis ex ut augue convallis tempor. Morbi ut quam eu sem vulputate ullamcorper vel nec tortor. Fusce tortor ipsum, rutrum ut porttitor eu, dictum vitae sem. Maecenas ullamcorper fringilla enim, vehicula consequat lectus maximus egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis fringilla mauris at metus elementum, sed viverra dui maximus. In fermentum condimentum mi, vitae bibendum turpi",
            status: 'visible',
            sentiment: 'positive',
            imageIDs: ["c85729679258","c85729679258","c85729679258","c85729679258","c85729679258"],
            videoIDs: ["c85729679258"]
        }

        setCache({
            key: "stNotes",
            identifier: mockNoteData.id,
            value: mockNoteData,
            expires: 0
        })
    }

    // reply data
    for(let i = 0; i < div; i++){
        let noteId = String(Math.floor(Math.random() * 99999999999))
        let mockReplyData = {
            noteId, 
            authorId: noteId,
            details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent mattis ex ut augue convallis tempor. Morbi ut quam eu sem vulputate ullamcorper vel nec tortor. Fusce tortor ipsum, rutrum ut porttitor eu, dictum vitae sem. Maecenas ullamcorper fringilla enim, vehicula consequat lectus maximus egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Duis fringilla mauris at metus elementum, sed viverra dui maximus. In fermentum condimentum mi, vitae bibendum turpi",
            status: 'visible'
        }
        let mockRepliesData = [];
        for(let i = 0; i < 50; i++){
            mockRepliesData.push(mockReplyData)
        }

        setCache({
            key: "stReplies",
            identifier: noteId,
            value: mockRepliesData,
            expires: 0
        })

        stressTestLastRepliesID = noteId
    }

    stressTestTotal += items;
    console.log("Stress test count: ", stressTestTotal)
    setTimeout(()=> {
        cacheStressTest(items * 3)
    }, stressTestDelay)
}

cacheStressTest()
*/

module.exports = {
    getCache,
    setCache
}