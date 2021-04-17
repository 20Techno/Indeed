import { MessageType } from '@adiwajshing/baileys'
import { createWriteStream, readFile } from 'fs-extra'
import { tmpdir } from 'os'
import ytdl, { getInfo, validateURL } from 'ytdl-core'
import { IReply } from '../../Typings'
import responses from '../responses.json'

export const download = async (url: string, type: 'video' | 'audio'): Promise<IReply | string> => {
    if (!validateURL(url)) return responses['invalid-url'].replace('{W}', 'YT').replace('{U}', url)
    const video = type === 'video'
    const filename = `${tmpdir()}/${Math.random().toString(30)}.${video ? 'mp4' : 'mp3'}`
    const { videoDetails: info } = await getInfo(url)
    if (Number(info.lengthSeconds) > 600) return responses['video-duration-clause']
    const stream = createWriteStream(filename)
    ytdl(url, { quality: !video ? 'highestaudio' : 'highest' }).pipe(stream)
    await new Promise((resolve, reject) => {
        stream.on('end', resolve)
        stream.on('error', (err) => reject(err && console.log(err)))
    })
    const caption = `📗 *Title:* ${info.title}\n📙 *Description:* ${info.description}\n📘 *Author:* ${info.author}`
    return { body: await readFile(filename), caption }
}

export const getYTMediaFromUrl = async (url: string, type: 'video' | 'audio'): Promise<IReply> => {
    if (!url) return { body: responses['wrong-format'] }
    const media = await download(url, type)
    if (typeof media === 'string') return { body: media }
    return { ...media, type: type === 'audio' ? MessageType.audio : MessageType.video }
}
