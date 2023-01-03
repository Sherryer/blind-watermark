import React, {useRef, useState} from 'react'
import {render} from 'react-dom'
// import watermark from 'blind-watermark'
import watermark from '../scripts/blind-watermark/lib/index'

var bl = [true, true, false, false, true]
var str = '测试数据噢'

let AddWm = () => {
    let ipt = useRef()
    let img = useRef()
    let wmIpt = useRef()
    let wmImg = useRef()
    let [radioValue, setRadio] = useState('bool')

    let [boolList, setBl] = useState(`[${bl.join(',')}]`)
    let [string, setStr] = useState(str)

    let onChange = (e) => {
        img.current.src = window.URL.createObjectURL(e.target.files[0])
    }
    let wmChange = (e) => {
        wmImg.current.src = window.URL.createObjectURL(e.target.files[0])
    }

    const load = async () => {
        let wm;
        if (radioValue === 'bool') {
            wm = JSON.parse(boolList)
        }

        if (radioValue === 'string') {
            wm = string
        }
        if (radioValue === 'img') {
            wm = wmImg.current
        }
        console.time('time')
        let res = await watermark.addWm({originImg: img.current, wm, wmType: radioValue, download: true })
          .then(() => {
            console.timeEnd('time');
          })
            .catch((e) => {
            console.log('添加水印失败：', e);
        })
    }

    const radioChange = (e) => {
        setRadio(e.target.value)
    }

    return (
        <div>
            <p>水印类型: {radioValue}</p>
            <div>
                <label><input name="wmType" defaultChecked type="radio" value='bool' onChange={radioChange}/> 布尔值 bool；</label>
                <label><input name="wmType" type="radio" value='string' onChange={radioChange}/> 字符串 string；</label>
                <label><input name="wmType" type="radio" value='img' onChange={radioChange}/> 图片 img；</label>
            </div>
            {radioValue === 'bool' &&
            <p>
                <input onChange={(e) => setBl(e.target.value)} value={boolList} style={{width: '400px'}}/>
            </p>
            }
            {radioValue === 'string' &&
            <p>
                <input onChange={(e) => setStr(e.target.value)} value={string} style={{width: '400px'}}/>
            </p>
            }
            {radioValue === 'img' &&
            <div>
                <p>
                    水印图：<input onChange={wmChange} ref={wmIpt} type="file"/>
                </p>
                <img ref={wmImg} src="" alt=""/>
            </div>
            }
            <p>
                图片：<input onChange={onChange} ref={ipt} type="file"/>
            </p>
            <div>
                <img src='' onLoad={load} ref={img}/>
            </div>
        </div>
    )
}


let Extract = () => {
    let ipt = useRef()
    let img = useRef()
    let [radioValue, setRadio] = useState('bool')
    let [length, setLength] = useState(5)

    let onChange = (e) => {
        img.current.src = window.URL.createObjectURL(e.target.files[0])
    }

    const load = () => {
        length = eval(length)
        watermark.extract({wmType: radioValue, wmLength: length, wmImg: img.current}).then(val => {
            if (radioValue !== 'img') {
                alert(val.wm)
            }
        })
    }

    const radioChange = (e) => {
        setRadio(e.target.value)
    }

    return (
        <div>
            <p>水印类型: {radioValue}</p>
            <div>
                <label><input name="wmType2" defaultChecked type="radio" value='bool' onChange={radioChange}/> 布尔值 bool；</label>
                <label><input name="wmType2" type="radio" value='string' onChange={radioChange}/> 字符串 string；</label>
                <label><input name="wmType2" type="radio" value='img' onChange={radioChange}/> 图片 img；</label>
            </div>
            <p>
                水印长度 <input type="text" value={length} onChange={(e) => setLength(e.target.value)}/>
            </p>
            <p>
                <input onChange={onChange} ref={ipt} type="file"/>
            </p>
            <img src='' onLoad={load} ref={img}/>
        </div>
    )
}

let EasyUse = () => {
    let onChange = (e) => {
        watermark.addWm({originImg: e.target.files, wm: str, wmType: 'string'})
    }
    return (
        <div>
            <h4>originImg 传入 FileList、File</h4>
            <div>originImg 传入 FileList 时会取 FileList[0]</div>
            <div>水印：{str}</div>
            <input onChange={onChange} type="file"/>

        </div>
    )
}

let App = () => {
    return (
        <div>
            <h3>blind-watermark</h3>
            <hr/>
            <h4>图片加水印</h4>
            <AddWm/>

            <h4>图片解水印</h4>
            <Extract/>

            <EasyUse/>
        </div>
    )
}

render(<App/>, document.getElementById('dom'));
