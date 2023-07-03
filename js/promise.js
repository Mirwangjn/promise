//进行覆盖Promise
function Promise(execute) {//promise的内部执行函数是同步的
    //实例对象上有两个属性PromiseState，PromiseResult
    this.PromiseState = "pending";
    this.PromiseResult = null;
    // this.callBack = {};
    this.callBack = [];
    // console.log(this);
    const self = this;
    function resolve(data) {//参数
        // console.log(this);打印为window
        /*
            这里如果直接用this的话不行，this指向他的调用者，
            而resolve没有在内部，不是实例对象调用，所以这里的this指向window
            所以为为实例对象的this赋值
        */
        if (self.PromiseState !== "pending") return;
        self.PromiseState = "fulfilled";
        self.PromiseResult = data;
        // if(self.callBack.onvalue){
        //     self.callBack.onvalue(data);
        // }
        // self.callBack.forEach((item) => {
        //     item.onvalue(data);
        // });
        setTimeout(() =>{
            self.callBack.forEach((item) => {
                item.onvalue(data);
            });
        },0)
    };
    function reject(data) {
        //状态只应该改变一次
        if (self.PromiseState !== "pending") return;
        self.PromiseState = "rejected";
        self.PromiseResult = data;
        // if(self.callBack.onreason){
        //     self.callBack.onreason(data);
        // }
        // self.callBack.forEach((item) => {
        //     item.onreason(data);
        // });
        setTimeout(() =>{
            self.callBack.forEach((item) => {
                item.onreason(data);
            });
        },0)
    }
    //内部参数有两参数,但是函数的引用中并没有resolve和reject。所以需要声明
    try {//实现throw 为rejected
        //构造函数的形参为函数时，且函数还是使用function时this指向为window
        execute(resolve, reject);
    } catch (error) {
        reject(error)
        // console.assert(error);
        console.error(error)
    }

};
//因为在实例对象的方法中没有then（），所以添加。
//then方法通过实例对象的状态来调用，返回结果为一个新的promise对象
Promise.prototype.then = function (onvalue, onreason) {
    //配合异常穿透的不给失败对调
    if (typeof onreason !== "function") {
        onreason = (reason) => {
            throw reason;
        }
    };
    //如果参数不是函数就设置一个默认参数
    if (typeof onvalue !== "function") {
        onvalue = value => value;
        // onreason = (value)=> {return value}
    }
    /*
        返回新的promise对象，这个对象通过之前的实例对象进行判断
        这里如果用function的话，this就指向调用者，execute()的调用者为window
        箭头函数没有this，往上找就找到了then()
    */
    return new Promise((resolve, reject) => {
        const self = this;//指向then方法
        function callBack(type) {
            // 在function内部，直接调用函数this指向window（除非使用箭头函数）
            try {
                // let res = type(this.PromiseResult);//使用时写的是函数，而我这负责调用
                let res = type(self.PromiseResult);//使用时写的是函数，而我这负责调用

                if (res instanceof Promise) {
                    res.then(v => {
                        resolve(v);
                    }, r => {
                        reject(r);
                    })
                } else {
                    resolve(res);
                }
            } catch (error) {
                reject(error);
                console.error("uncaught")
            }
        };
        let callBack1 = (type) => {
            try {
                // let res = type(this.PromiseResult);//使用时写的是函数，而我这负责调用
                let res = type(this.PromiseResult);//使用时写的是函数，而我这负责调用

                if (res instanceof Promise) {
                    res.then(v => {
                        resolve(v);
                    }, r => {
                        reject(r);
                    })
                } else {
                    resolve(res);
                }
            } catch (error) {
                reject(error);
                console.error("uncaught")
            }
        }
        // console.log(this);
        //这里的this(在使用箭头函数的情况下)指向实例对象，根据实例对象的值来判断调用哪个函数
        if (this.PromiseState === "fulfilled") {
            //拿到返回状态
            // try {
            //     let res = onvalue(this.PromiseResult);//使用时写的是函数，而我这负责调用
            //     if (res instanceof Promise) {
            //         res.then(v => {
            //             resolve(v);
            //         }, r => {
            //             reject(r);
            //         })
            //     } else {
            //         resolve(res);
            //     }
            // } catch (error) {
            //     reject(error);
            //     console.error("uncaught")
            // }
            
            // callBack(onvalue);
            setTimeout(() =>{
                callBack(onvalue);
            },0)
            // callBack1(onvalue)
        };
        //失败的同步的结果
        if (this.PromiseState === "rejected") {//针对then内部的同步情况
            // try {
            //     let res = onreason(this.PromiseResult);
            //     if (res instanceof Promise) {
            //         res.then(v => {
            //             resolve(v)
            //         }, r => {
            //             reject(r)
            //         })
            //     } else {
            //         resolve(res);
            //     }
            // } catch (error) {
            //     reject(error);
            //     console.error("uncaught error")
            // }
            // callBack(onreason)
            setTimeout(() =>{
                callBack(onreason)
            },0)
            
        };
        //异步情况
        if (this.PromiseState === "pending") {
            //进行追加
            this.callBack.push({//针对异步
                onvalue: function () {
                    /*
                        拿到then的返回值
                        因为这里的this指向为对象，不是指向then()
                    */
                    //    try {
                    //         let res = onvalue(self.PromiseResult);//调用函数的同时拿到了返回值
                    //         //对返回值进行判断
                    //         if (res instanceof Promise) {
                    //             res.then(v => {
                    //                 resolve(v);//异步改变result的状态
                    //             }, r => {
                    //                 reject(r);
                    //             })
                    //         } else {
                    //             resolve(res);
                    //         }
                    //    } catch (error) {
                    //         reject(error);
                    //         console.error("uncaught error")
                    //    }
                    // callBack(onvalue)
                    setTimeout(() =>{
                        callBack(onvalue);
                    },0)
                    // callBack1(onvalue)
                },
                onreason: function () {
                    //     try {
                    //         let res = onreason(self.PromiseResult);//调用函数的同时拿到了返回值
                    //         //对返回值进行判断
                    //         if (res instanceof Promise) {
                    //             res.then(v => {
                    //                 resolve(v);//异步改变result的状态
                    //             }, r => {
                    //                 reject(r);
                    //             })
                    //         } else {
                    //             resolve(res);
                    //         }
                    //    } catch (error) {
                    //         reject(error);
                    //         console.error("uncaught error")
                    //    }
                    // callBack(onreason);
                    setTimeout(() =>{
                        callBack(onreason);
                    },0)
                    // callBack1(onreason)
                }
            })
        }

    })

};
//声明catch（）
Promise.prototype.catch = function (onreason) {
    return this.then(undefined, onreason);
};

/*
    添加resolve静态方法
    data除了promise函数之外的其他类型返回的promise对象状态都是fulfiled。
    只有promise函数的reject()可以更改此方法的状态
*/
Promise.resolve = function (data) {
    return new Promise((resolve, reject) => {
        if (data instanceof Promise) {
            data.then((value) => {
                resolve(value)
            }, (reason) => {
                reject(reason)
            })
        } else {
            resolve(data);
        }
    })
}
/*
    reject静态方法
*/
Promise.reject = function (data) {
    return new Promise((resolve, reject) => {
        reject(data)
    })
};
/*
    参数为promise对象数组
    返回结果为promise对象，如果数组的promise对象状态都为fulfilled
    ，则为fulfilled。
    只要有一个为rejected则为rejected
*/
Promise.all = function (arr) {
    return new Promise((resolve, reject) => {
        /*
            只针对与同步的情况下
        */
        // let flag = true;
        // let result = [];
        // let rejectValue ;
        //     arr.forEach( item => {
        //         // console.log(item.PromiseState);
        //         if(item.PromiseState !== "fulfilled"){
        //             flag = false;
        //             rejectValue = item.PromiseResult;
        //             return;
        //         } else{
        //             result.push(item.PromiseResult)
        //         }

        //     });
        //      if(flag === false){
        //             reject(rejectValue)
        //         } else{
        //             resolve(result)
        //         }
        let count = 0;
        let array = [];
        arr.forEach((item, index) => {
            item.then((v) => {
                // console.log(v);
                count++;
                //在promise中如果只是push可能会导致顺序不匹配。所以使用下标为好
                // array.push()
                array[index] = v;
                if (count === arr.length) {

                    resolve(array)
                }
            }, (r) => {
                reject(r)
            })
        })
    })
};
Promise.race = function (arr) {
    return new Promise((resolve, reject) => {
        // try {
        //     arr[0].then((v) => {
        //         resolve(v)
        //     }, (r) => {
        //         reject(r)
        //     })
        // } catch (error) {
        //     console.warn("Uncaught (in promise) ")
        // }
        //另一种写法
        arr.forEach( item =>{
            item.then(v =>{
                resolve(v)
            },r =>{
                reject(r)
            })
        })
    })
}