


window.addEventListener('dragover', function(evt){
  //evt.dataTransfer.dropEffect = "none";
  evt.preventDefault();
}, false);


window.addEventListener('drop', function(ev){
  ev.preventDefault();
  ev.stopPropagation();
}, false);


//Int型を文字列の16進数の8桁に変換する関数
function _toString08x(num) {
  return num.toString(16).padStart(8, '0');
}

/**2次元配列(data_ary) をhtmlの１つのテーブルを表示する関数
 * data_ary[0] がtable headr(th)
 * 列要素をボタン表示にする場合はbtn_colを設定。defaultはなし 例)列1をボタンにする btn_col = [1], 
*/
function generate_table_html(dataObj_ary, id = '', class_name = '', btn_col = []) {

  let str_html = '';

  //defaultのgen_tbl の他に引数で指定されたクラス名を付ける
  const class_names = 'gen_tbl ' + class_name;

  if (id) {
    str_html += `<table id="${id}" class="${class_names}">`;
  }
  else {
    str_html += `<table class="${class_names}">`;
  }


  for (let row_idx = 0; row_idx < dataObj_ary.length; row_idx++) {

    const data_ary = dataObj_ary[row_idx].table_row;

    //colorフラグが有効だった場合はclass属性を設定
    str_html += (dataObj_ary[row_idx].color) ? '<tr class="value_false">' : '<tr>';

    for (let i = 0; i < data_ary.length; i++) {
      //table headr
      if (row_idx == 0) {
        str_html += `<th>${data_ary[i]}</th>`;
      }
      else {
        //ボタン表示が有効の場合はボタン表示とする
        const str_btn = (btn_col.indexOf(i) >= 0) ? `<button id="btn_ch${row_idx - 1}" class="btn${i}">${data_ary[i]}</button>` : `${data_ary[i]}`;
        str_html += `<td>${str_btn}</td>`;
      }
    }
    str_html += '</tr>';
  }

  str_html += '</table>';
  return str_html;
}




class HtmlView {

  constructor(htmlObj) {
    this._htmlObj = htmlObj; //このオブジェクトのinnerHTMLを更新することで画面が描画される
    this._start_html = '';
    this._summary_html = '';
  }

  create_start_view() {
    //create StartView
    let start_html = '';

    start_html += '<div id=start_wrapper>';
    //Dumpファイル選択ボタン
    start_html += '<div id="divbtn_dmupfile">Dumpファイルを選択 or FileDrop</div>';
    start_html += '<input type="file" id="dumpfile"/>';
    start_html += '<input type="text" id="dump_filename" placeholder="ファイルが選択されていません" readonly />';
    start_html += '<br>';
    //メインレシピ選択ボタン
    start_html += '<div id="divbtn_mrcpfile">メインレシピファイルを選択 or FileDrop</div>';
    start_html += '<input type="file" id="mrcpfile"/>';
    start_html += '<input type="text" id="mrcp_filename" placeholder="ファイルが選択されていません" readonly />';
    start_html += '<div id="start_descript0">メインレシピ名表示を使わない場合はファイル選択しなくてOK</div>';


    start_html += '<div><button id="btn_analize" disabled="disabled">解析スタート!</div>';
    start_html += '</div>';



    //ここでスタート画面ができあがる
    this._htmlObj.innerHTML = start_html;

    const show_fname = (val, id_input_text) => {
      const path = val.replace(/\\/g, '/');
      const match = path.lastIndexOf('/');
      $(id_input_text).val(match !== -1 ? val.substring(match + 1) : val);
    };

    function set_filebtn_jquery(id_input_file, id_divbtn, id_input_text) {
      
      $(id_input_file).change(function() {
        show_fname($(this).val(), id_input_text);
      });
      
      $(id_input_text).bind('keyup, keydown, keypress', function () {
        return false;
      });
      
      //divボタンを押したら dumpfile(input type=file)のclickイベントを発動
      $(id_divbtn).click(function () {
        $(id_input_file).trigger('click');
      });
    }

    set_filebtn_jquery('#dumpfile', '#divbtn_dmupfile', '#dump_filename');

    set_filebtn_jquery('#mrcpfile', '#divbtn_mrcpfile', '#mrcp_filename');
    /*
    const show_fname = (val) => {
      const path = val.replace(/\\/g, '/');
      const match = path.lastIndexOf('/');
      $('#dump_filename').val(match !== -1 ? val.substring(match + 1) : val);
    };
    
    $('#dumpfile').change(function() {
      show_fname($(this).val());
    });
    
    $('#dump_filename').bind('keyup, keydown, keypress', function () {
      return false;
    });
    
    //divボタンを押したら dumpfile(input type=file)のclickイベントを発動
    $('#divbtn_dmupfile').click(function () {
      $('#dumpfile').trigger('click');
    });
    */
    //イベントの登録
    const dropArea = document.querySelector('#divbtn_dmupfile');
 
    document.querySelector('#dumpfile').addEventListener("change", (evt) => {
      let file = evt.target.files;
      //FileReaderの作成
      let reader = new FileReader();
      reader.readAsText(file[0]);
    
      // readAsText() が終了後に呼び出される
      reader.onload = (evt) => {
        console.log('call reader onload');
        read_file(evt.target.result);
      };
    
    }, false);
    
    //DOMイベントを登録
    //ドロップを受け入れる要素のdragoverにpreventDefaultを記述しておかないと、dropイベントが発火しない
    dropArea.addEventListener('dragover', (evt) => {
      
      evt.preventDefault();
      evt.dataTransfer.dropEffect = "copy";
      dropArea.classList.add('dropover');
    });

    dropArea.addEventListener('dragleave', (evt) => {
      dropArea.classList.remove('dropover');
    });
    
    //dropイベントで発火する処理の登録
    dropArea.addEventListener('drop', (evt) => {
      evt.preventDefault();

      dropArea.classList.remove('dropover');
      // evt.dataTransfer.filesはFileListオブジェクト
      const fileList = evt.dataTransfer.files;
    
      // Array.prototypeメソッドを使えるようにするため、FileListをArrayに変換する
      const fileArray = Array.from(fileList);
    
      //テキストボックスにドロップしたファイル名を表示
      show_fname(fileArray[0].name, '#dump_filename');

      //FileReaderの作成
      let reader = new FileReader();
      reader.readAsText(fileArray[0]);

      //readAsText() が終了後に呼び出される
      reader.onload = (evt) => {
        //console.log('call reader onload at drop event');
        alert('call reader onload at drop event');
        read_file(evt.target.result);
      };
    
    });
    
    
    //const btn_analize = document.querySelector('#btn_analize');
    document.querySelector('#btn_analize').addEventListener('click', OnButtonClick_analize);
    
  }

  create_summary_view(html_str) {
    this._summary_html = html_str;
    this._htmlObj.innerHTML = html_str;

    //HTMLで配置したボタンのオブジェクトを取得してコールバック関数を登録(18CH全て同じ関数)
    const node_list = document.querySelectorAll(`.btn${1}`);
    for (let i = 0; i < node_list.length; i++) {
      node_list[i].addEventListener('click', (evt) => {
        //"evt.srcElement.id"からHTMLのidを取得してbtn_ch*** の数字部分を取り出す
        const matchOB = /btn_ch(\d+)/.exec(evt.srcElement.id);
        alert(`btnID: ${matchOB[1]} click`);
        this._showDumpData_by_CH(parseInt(matchOB[1]));
      });
    }
  }

  //CH毎のDumpデータを表示する関数 引数ch_idx(Int): 0-17
  _showDumpData_by_CH(ch_idx) {
    console.log(`ch=${ch_idx}`);

    //HTMLに表示するテーブルの作成, show_data_aryは配列の配列
    //let tbl_data_ary = [['bitreg_name', 'bit', 'value', 'description', '正常値', 'コメント']];
    const regChObj = g_dumpAnalyzer.get_anlzObj_by_channel(ch_idx);

    g_htmlView.create_ch_view(regChObj, ch_idx);
  }


  _ch_summaryView(regChObj) {

    let html_str = '<h1>Summary</h1>';

    const tbl_data_ary = [];
    tbl_data_ary.push({ 'table_row': ['addr', 'module', 'reg_name', 'judge'], 'color': false });

    for (let obj of regChObj) {
      let reg_name_with_a = `<a href="#${obj.reg_name}">${obj.reg_name}</a>`;
      tbl_data_ary.push({ 'table_row': [obj.addr, obj.module_name, reg_name_with_a, obj.judge_all], 'color': false });
    }

    html_str += generate_table_html(tbl_data_ary, 'ch_summary_tbl');

    return html_str;

  }

  _ch_regDumpView(regChObj) {

    let html_str = '<h1>Register Dump</h1>';
    html_str += '<ul>';

    for (let obj of regChObj) {
      let tbl_data_ary = [];
      tbl_data_ary.push({ 'table_row': ['bitreg_name', 'bit', 'value', 'description', '正常値', 'コメント'], 'color': false });

      for (let bit_elem of obj.bit_reg) {
        const temp_str = `[${bit_elem.bit_msb}:${bit_elem.bit_lsb}]`;
        const bit_val_hex = (bit_elem.bit_val !== undefined) ? bit_elem.bit_val.toString(16).toUpperCase() : bit_elem.bit_val;

        //bit値と期待値を比較
        const color_flg = bit_elem.judge == 'NG' ? true : false;
        tbl_data_ary.push({ 'table_row': [bit_elem.name, temp_str, bit_val_hex, bit_elem.description, bit_elem.normal_val, bit_elem.commnet], 'color': color_flg });
      }

      //表示は大文字にする
      const addr_str = (obj.addr !== undefined) ? obj.addr.toUpperCase() : obj.addr;
      const reg_val_str = (obj.reg_val !== undefined) ? obj.reg_val.toUpperCase() : obj.reg_val;


      html_str += `<li id="${obj.reg_name}">[${obj.reg_name}] addr=${addr_str}, val=${reg_val_str} (${obj.module_name})</li>`;
      html_str += generate_table_html(tbl_data_ary, '', 'dump_tbl');

      //console.log(tbl_data_ary);

    }
    html_str += '</ul>';

    return html_str;
  }

  //NDC TAG情報の表示
  _ch_ndcTagInfoView(ch_idx) {
    let html_str = '<h1>NDC_TAG情報</h1>';

    const tbl_data_ary = [];
    tbl_data_ary.push({ 'table_row': ['NDC_TAG番号', 'MainRecipe', 'IU_FULL(コマンド残留)', 'NDC_TAG_ADDR', 'NDC_TAG_WORD0', 'L2PInfoTbl_ADDR'], 'color': false });

    const reg_iu_full_bimap = g_dumpAnalyzer.get_register_IU_FULL(ch_idx);

    //NDC_TAGは16個
    for (let i = 0; i < 16; i++) {
      const iu_full_flg = (reg_iu_full_bimap & (0x1 << i)) != 0 ? 'False' : 'True';
      const ndc_tag_addr = g_dumpAnalyzer.calc_NDC_TAG_ADDR(i, ch_idx);
      const infoObj = g_dumpAnalyzer.calc_L2PInfoTbl_ADDR(ndc_tag_addr, ch_idx);
      const temp_ary = [i, 'HOGE_RECIPE', iu_full_flg, _toString08x(ndc_tag_addr), infoObj.L2P_TAG, _toString08x(infoObj.l2pInfoTbl_addr + 0x100 * i)];
      tbl_data_ary.push({ 'table_row': temp_ary, 'color': false });
    }

    html_str += generate_table_html(tbl_data_ary, 'ch_ndctag_tbl', '', [5]);
    return html_str;
  }

  _ch_l2pInfoTblView() {
    let html_str = '<h1>L2PInfoTbl情報 L2P_TAG:<span id="l2p_tag"></span></h1>';

    const tbl_data_ary = [];
    tbl_data_ary.push({ 'table_row': ['index', 'DATA(1WORD)'], 'color': false });

    //L2PInfoTblは32WORD
    for (let i = 0; i < 32; i++) {
      tbl_data_ary.push({ 'table_row': [i, '---'], 'color': false });
    }

    html_str += generate_table_html(tbl_data_ary, 'ch_l2pinfo_tbl');
    return html_str;

  }

  //各CHの詳細を表示する
  create_ch_view(regChObj, ch_idx) {

    let html_str = '';

    //summaryへ戻るボタン
    html_str += '<div><input type="button" id="btn_back_summary" name="btn_back_summary"  value="Summaryへ戻る"/></div>';


    /*** Summary View */
    html_str += this._ch_summaryView(regChObj);

    /**** NDC TAG Info View*/
    html_str += this._ch_ndcTagInfoView(ch_idx);

    /**** L2PInfoTbl 情報*/
    html_str += this._ch_l2pInfoTblView();

    /*** Register Dump */
    html_str += this._ch_regDumpView(regChObj);

    this._htmlObj.innerHTML = html_str;


    document.querySelector('#btn_back_summary').addEventListener("click", (evt) => {
      g_htmlView.change_summary_view();
    });

    //HTMLで配置したボタンのオブジェクトをクラスで取得してコールバック関数を登録(18CH全て同じ関数)
    const node_list = document.querySelectorAll(`.btn${5}`);
    for (let i = 0; i < node_list.length; i++) {
      node_list[i].addEventListener('click', (evt) => {
        //"evt.srcElement.innerText"からボタンに示されたアドレスの数字部分を取り出す
        //const matchOB = /([0-9a-fA-F]+)/.exec(evt.srcElement.innerText);
        //alert(`L2PInfoTbl_Addr: ${evt.srcElement.innerText}`);


        document.querySelector('#l2p_tag').innerText = `${evt.srcElement.innerText}`;

        const L2PInfoTbl_obj = document.querySelector('#ch_l2pinfo_tbl');

        for (let i = 0; i < 32; i++) {
          L2PInfoTbl_obj.rows[1 + i].cells[1].innerText = `hoge${i} ${evt.srcElement.innerText}`;
        }


        //this._showDumpData_by_CH(parseInt(matchOB[1]));
      });
    }



  }


  change_summary_view() {
    //this._htmlObj.innerHTML = this._summary_html;
    this.create_summary_view(this._summary_html);
  }
}



const html_obj = document.querySelector("#html_txt");

//Viewクラスを生成
const g_htmlView = new HtmlView(html_obj);


//create StartView
g_htmlView.create_start_view();




let g_addr_table = {}; //key:アドレス(string), val:値(string)の辞書。read_fileで読み込まれる
let g_dumpAnalyzer = null;   //クラスDumpAnalyzer を保持する変数






class DumpAnalyzer {

  constructor(ch_num, json_exel, addr_dict) {
    this._ch_num = ch_num; //チャネル数
    this._json_exel = json_exel;
    this._addr_dict = addr_dict;  ///key:アドレス(string), val:値(string)の辞書

    this.NDC_BASE = 0x40000000;
    this.NDC_CMD_POOL_BASE = this.NDC_BASE + 0x00010000;
    this.CH_OFFSET = 0x00080000;

    //18ch(ch_num)の解析データ, json_exelのコピーを作成。addrのみ書き換える
    //オブジェクトの配列
    this._ch_anlz_registers = [];

    this._create_ch_anlz();
    this._data_analize();
  }

  get_anlzObj_by_channel(ch_num) {
    return this._ch_anlz_registers[ch_num];
  }

  //CH毎にerrorが一つでもあるかどうかを調べて結果を配列で返す。ch_numが返却する配列のlength
  //一つも評価していない場合は'UNKNOWN'
  get_result_by_channel() {
    let ret_val_ary = [];

    for (let ch_registers_ary of this._ch_anlz_registers) {
      let ch_judge = 'UUKNOWN'; //'UUKNOWN'は判定不能
      for (let obj of ch_registers_ary) {
        if (obj.judge_all == 'NG') {
          ch_judge = 'NG';
          break;
        }
        else if (obj.judge_all == 'OK') {
          if (ch_judge == 'UNKNONE') {
            ch_judge == 'OK';
          }
        }
      }
      ret_val_ary.push(ch_judge);
    }
    return ret_val_ary;
  }

  //18ch分の_ch_anlz_registersを作成する
  _create_ch_anlz() {
    for (let i = 0; i < this._ch_num; i++) {
      //コピーを生成
      const copy_ary = JSON.parse(JSON.stringify(this._json_exel));
      //CHオフセットを足してaddrを上書き
      for (let obj_elem of copy_ary) {
        obj_elem.addr = _toString08x(parseInt(obj_elem.addr, 16) + this.CH_OFFSET * i); //0をつけて8桁にする;
        console.log(obj_elem.addr);
      }
      this._ch_anlz_registers.push(copy_ary);
    }
  }

  //32bitレジスタから[msb:lsb] で指定した値を抜き出す
  //data32が数字でない場合は '-' を返す
  _pick_reg32_slice(data32, msb, lsb) {
    if (!isNaN(data32)) {
      return (data32 << (31 - msb)) >>> (31 - msb + lsb);
    }
    else {
      return '-';
    }
  }

  //アドレステーブルからデータを取得して、各種ビットを生成し期待値を比較して結果を格納する
  _data_analize() {
    ////18CH分の解析すべき値を_addr_dictから読み込む
    for (let ch_registers_ary of this._ch_anlz_registers) {
      for (let obj of ch_registers_ary) {

        //アドレステーブルからデータを取得し、プロパティ reg_val に追加
        const reg_val32 = this._addr_dict[obj.addr];
        obj['reg_val'] = reg_val32;

        let judge_all = 'UUKNOWN'; //'UUKNOWN'は判定なしを示す
        for (let elme of obj.bit_reg) {
          let bit_val = this._pick_reg32_slice(parseInt(reg_val32, 16), elme.bit_msb, elme.bit_lsb);
          //計算したbitレジスタの値をプロパティとして追加
          elme['bit_val'] = bit_val;

          //正常値と等しいかを判定してプロパティを追加
          const normal_int = parseInt(elme.normal_val, 16);
          if (!isNaN(bit_val) && !isNaN(normal_int) && bit_val == normal_int) {
            elme['judge'] = 'OK';
            if (judge_all == 'UUKNOWN') {
              judge_all = 'OK';
            }
          }
          else if (!isNaN(bit_val) && !isNaN(normal_int) && bit_val != normal_int) {
            elme['judge'] = 'NG';
            judge_all = 'NG';
          }
          else {
            elme['judge'] = '';
          }
        }
        //新規プロパティ(judge_all)を追加
        //bit_Regの中でjudgeが1つもなければ'', 1つでもFalseがある場合はFlase, それ以外をTrueという
        obj['judge_all'] = judge_all;
      }
    }
  }

  //NDC_TAG_ADDRを計算する。int型で返す
  calc_NDC_TAG_ADDR(ndc_tag_num, ch_idx) {

    return this.NDC_CMD_POOL_BASE + (this.CH_OFFSET * ch_idx) + (0x200 * ndc_tag_num);
  }

  //ndc_tagが指し示すL2PInfoTblのアドレスを計算する。
  //l2pInfoTbl_addr, L2P_TAG, NDM_TAGをオブジェクトで返す
  calc_L2PInfoTbl_ADDR(ndc_tag_addr, ch_idx) {

    //ndct_tag_addrのワード0にアクセスするとNDM_TAG(アドレス)とL2P_TAGがわかる
    const ndc_tag_word0 = this._addr_dict[_toString08x(ndc_tag_addr)];

    const l2p_tag = 0; //ndc_tag_word0からわかる
    const ndm_tag = 0; //ndc_tag_word0からわかる
    const l2pInfoTbl_addr = this.NDC_CMD_POOL_BASE + (this.CH_OFFSET * ch_idx) + (0x200 * 16) + (0x80 * l2p_tag);

    return { l2pInfoTbl_addr: l2pInfoTbl_addr, L2P_TAG: l2p_tag, NDM_TAG: ndm_tag };
  }

  //IU_FULLのレジスタ値を返す.Int型で返す
  get_register_IU_FULL(ch_idx) {
    const addr_str = _toString08x(this.NDC_BASE + (this.CH_OFFSET * ch_idx) + 0x1B0);
    return parseInt(this._addr_dict[addr_str], 16);
  }

}

function viewSummary() {

  //CH毎にerrorが一つでもあるかどうかを調べる

  const ch_judge_ary = g_dumpAnalyzer.get_result_by_channel();

  //create html ary
  let html_ary = [];
  html_ary.push({ 'table_row': ['CH', '判定'] });
  for (let i = 0; i < ch_judge_ary.length; i++) {
    html_ary.push({ 'table_row': [`CH${i}`, ch_judge_ary[i]], 'color': false });
  }

  let html_str = generate_table_html(html_ary, 'summary_tbl', '', [1]);
  //const html_obj = document.getElementById("html_txt");  

  //let html_str = generate_table_html(tbl_data_ary);
  //g_html_obj.innerHTML = html_str;
  //console.log(html_str);

  g_htmlView.create_summary_view(html_str);

}

function OnButtonClick_analize(evt) {

  let json_data = [];

  //jsonデータの読み込み
  axios.get('./excel.json')
    .then(function(response) {
      json_data = response.data;
      console.log(json_data);
      g_dumpAnalyzer = new DumpAnalyzer(18, json_data, g_addr_table);
      viewSummary();

    })
    .catch(function(error) {
      console.log(error);
    });
}



//binファイル読み込み処理。辞書addr_table(key(addr):"000000004", val: "00000000")を作成
function read_file(input_text) {

  //改行を区切りで配列を生成
  let text_ary = input_text.split(/\r\n|\r|\n/);



  for (let i = 0; i < text_ary.length; i++) {
    //const matchOB = /([0-9a-f]+)=*\s+([0-9a-f]+)\s+([0-9a-f]+)\s+([0-9a-f]+)\s+([0-9a-f]+)\s*/.exec(text_ary[i].toLowerCase());
    const matchOB = /([0-9a-f]+).*\s+([0-9a-f]+)\s+([0-9a-f]+)\s+([0-9a-f]+)\s+([0-9a-f]+)\s*/.exec(text_ary[i].toLowerCase());

    if (matchOB) {

      //+4した8桁の16進数の小文字の文字列を作る（toStringのdefaultは小文字）
      let idx_p1 = _toString08x(parseInt(matchOB[1], 16) + 4); //0をつけて8桁にする
      let idx_p2 = _toString08x(parseInt(matchOB[1], 16) + 8); //0をつけて8桁にする
      let idx_p3 = _toString08x(parseInt(matchOB[1], 16) + 12); //0をつけて8桁にする

      g_addr_table[matchOB[1]] = matchOB[2];
      g_addr_table[idx_p1] = matchOB[3];
      g_addr_table[idx_p2] = matchOB[4];
      g_addr_table[idx_p3] = matchOB[5];
    }


  }


  let random_idx = (Math.floor(Math.random() * Object.keys(g_addr_table).length) & 0xFFFFFFFC) + 0x40000000;
  let idx_str = _toString08x(random_idx); //0をつけて8桁にする
  console.log(`read finish ${text_ary.length}, g_addr_table[${idx_str}]=${g_addr_table[idx_str]}`);
  // alert(`read finish ${text_ary.length}, g_addr_table[${idx_str}]=${g_addr_table[idx_str]}`);

  //解析スタートボタンを有効にする
  document.querySelector("#btn_analize").removeAttribute("disabled");


}

