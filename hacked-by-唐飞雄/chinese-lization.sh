#!/bin/bash

set -e

REPO_BASE=$(dirname "${BASH_SOURCE[0]}")/..
MSG_FILE=messages-zh.xtb

MSG_TEMP=$(mktemp --dry-run)
CONF_TEMP=$(mktemp --dry-run)

GIT_REV=$(git rev-parse --short HEAD)

item=$(grep '"key": *"zh"' $REPO_BASE/i18n/locale_conf.json | tr -d " {}\"")
var=$(echo $item | tr ":.," "-")
case $var in
    file-*)
        MSG_FILE=$(echo $item | cut -d, -f1 | cut -d: -f2)
		;;
    key-zh-file-*)
        MSG_FILE=$(echo $item | cut -d, -f2 | cut -d: -f2)
        ;;
    key-zh-)
        item=$(grep -A1 '"key": *"zh"' ../i18n/locale_conf.json | tail -n 1 | tr -d " }\"")
        MSG_FILE=$(echo $item | cut -d: -f2)
		;;
    key-zh)
        item=$(grep -B1 '"key": *"zh"' ../i18n/locale_conf.json | head -n 1 | tr -d " {\"")
        MSG_FILE=$(echo $item | cut -d: -f2)
		;;
    *)
        sed 's/\({"file": "messages-en\.xtb", "key": "en"}\)/\1,\n    {"file": "messages-zh.xtb", "key": "zh"}/' $REPO_BASE/i18n/locale_conf.json >> $CONF_TEMP
		;;
esac

sed 's/lang="en"/lang="zh"/' $REPO_BASE/i18n/messages-en.xtb >> $MSG_TEMP

save_and_clean_temp(){
    if [ -f $REPO_BASE/i18n/$MSG_FILE ]; then
       mv $REPO_BASE/i18n/$MSG_FILE $REPO_BASE/i18n/$MSG_FILE.$GIT_REV
    fi
    mv $MSG_TEMP $REPO_BASE/i18n/$MSG_FILE

    if [ -f $CONF_TEMP ]; then
       mv $REPO_BASE/i18n/locale_conf.json $REPO_BASE/i18n/locale_conf.json.$GIT_REV
       mv $CONF_TEMP $REPO_BASE/i18n/locale_conf.json
    fi

    true
}

# register clean_temp on EXIT
trap "save_and_clean_temp" EXIT

# MSG_ALL_NAMESPACES, MSG_BREADCRUMBS_*_LABEL, MSG_CHROME_NAV_NAV_*
sed -i 's/> *Admin *</>管理(Admin)</g; s/> *Namespaces *</>名字空间(Namespaces)</g; s/> *Nodes *</>工作节点(Nodes)</g; s/> *Persistent Volumes *</>持久性存储卷(Persistent Volumes)</g' $MSG_TEMP
sed -i 's/> *Namespace *</>名字空间(Namespace)</g; s/> *All \+namespaces *</>包括所有名字空间(All namespaces)</g' $MSG_TEMP
sed -i 's/> *Workloads *</>载荷(Workloads)</g; s/> *Deployments *</>部署(Deployments)</g; s/> *Replica \+Sets *</>复制集(Replica Sets)</g; s/> *Replication \+Controllers *</>复制控制(Replication Controllers)</g' $MSG_TEMP
sed -i 's/> *Daemon \+Sets *</>守护式Pod集(Daemon Sets)</g; s/> *Stateful \+Sets *</>有状态POD集(Stateful Sets)</g; s/> *Jobs *</>批量任务(Jobs)</g; s/>Pods</>容器组(Pods)</g' $MSG_TEMP
sed -i 's/> *Services \+and \+discovery *</>服务和发现(Services and discovery)</g; s/> *Services *</>服务(Services)</g; s/> *Ingresses *</>入口地址(Ingresses)</g' $MSG_TEMP
sed -i 's/> *Storage *</>存储(Storage)</g; s/> *Persistent \+Volume \+Claims *</>持久性存储卷索取(Persistent Volume Claims)</g' $MSG_TEMP
sed -i 's/> *Config *</>配置字典(Config)</g; s/> *Secrets *</>保密式字典(Secrets)</g; s/> *Config \+Maps *</>配置式字典(Config Maps)</g' $MSG_TEMP
sed -i 's/> *Pet \+Sets *</>有状态Pod集(Pet Sets)</g' $MSG_TEMP
sed -i 's/> *Create \+an \+app *</>创建应用</g; s/> *Upload *</>上传(Upload)</g; s/> *Horizontal \+Pod \+Autoscalers *</>Pod水平自动伸缩</g' $MSG_TEMP
sed -i 's/> *Ingress *</>入口地址(Ingress)</g; s/> *Internal \+error *</>内部错误(Internal error)</g; s/> *Logs *</>日志</g;' $MSG_TEMP

# MSG_ACTION_BAR_*_TOOLTIP
sed -i 's/> *Delete *</>删除</g; s/> *Edit *</>编辑</g' $MSG_TEMP

# MSG_COMMON_COMPONENTS_ACTIONBAR
sed -i 's/> *Delete *</>删除</g;s/> *Edit *</>编辑</g;s/> *Create *</>新建</g' $MSG_TEMP
sed -i 's/> *Deploy \+app *</>部署应用</g;s/> *Upload \+YAML *</>上传YAML</g' $MSG_TEMP
sed -i 's/> *Create \+an \+application \+or \+any \+Kubernetes \+resource *</>创建应用或其它Kubernetes资源</g' $MSG_TEMP

# MSG_COMMON_COMPONENTS_ANNOTATIONS
sed -i 's/> *Created \+by *: *</>创建注记(Created-by:)</g' $MSG_TEMP
sed -i 's/> *show \+fewer \+annotations *</>显示简要注记</g;s/> *show \+all \+annotations *</>显示所有注记</g' $MSG_TEMP
sed -i 's/> *last \+applied \+configuration *</>当前配置的注记(last-applied-configuration:)</g' $MSG_TEMP

# MSG_COMMON_COMPONENTS_CONDITIONS
sed -i 's/> *Conditions *</>现状(Conditions)</g;s/> *Type *</>类型(Type)</g;s/> *Status *</>状态(Status)</g' $MSG_TEMP
sed -i 's/> *Last \+heartbeat \+time *</>最近心跳(Last heartbeat time)</g;s/> *Last \+transition \+time *</>最近传送(Last transition time)</g' $MSG_TEMP
sed -i 's/> *Reason *</>原因(Reason)</g;s/> *Message *</>消息(Message)</g' $MSG_TEMP

# MSG_COMMON_COMPONENTS_LABELS
sed -i 's/> *show \+fewer \+labels *</>显示简要标签</g;s/> *show \+all \+labels *</>显示所有标签</g' $MSG_TEMP

# MSG_COMMON_COMPONENTS_RESOURCECARD
sed -i 's/> *View\/Edit *YAML *</>编辑查看YAML</g;s/> *View\/edit *YAML *</>编辑查看YAML</g;s/> *Actions *</>动作(Actions)</g' $MSG_TEMP

# MSG_COMMON_COMPONENTS_RESOURCEDETAIL
sed -i 's/> *Name *</>名称(Name)</g;s/> *Namespace *</>名字空间(Namespace)</g;s/> *Labels *</>标签(Labels)</g;s/> *Annotations *</>注记(Annotations)</g;s/> *Creation \+time *</>创建时间</g' $MSG_TEMP

# MSG_COMMON_COMPONENTS_ZEROSTATE
sed -i 's/> *There \+is \+nothing \+to \+display \+here *</>无内容显示</g' $MSG_TEMP
sed -i 's/> *You \+can *&lt;/>现在就\&lt;/g;s/&gt;deploy a containerized app&lt;/\&gt;部署容器应用\&lt;/g;s/&gt;, select other namespace or &lt;/\&gt;，去其它名字空间，或从\&lt;/g;s/&gt;take the Dashboard Tour &lt;/\&gt;仪表盘教程\&lt;/g;s/&gt; to learn more.</\&gt;做更多了解</g' $MSG_TEMP

# MSG_COMMON_NAMESPACE
sed -i 's/> *Selector \+for \+namespaces *</>所选的名字空间标签</g' $MSG_TEMP

# MSG_COMMON_RESOURCE
sed -i 's/> *Delete \+a *{{::/>删除{{::/g;s/> *Are \+you \+sure \+you \+want \+to \+delete {{::/>确实要删除{{::/g;s/&gt; *in \+namespace *&lt;/\&gt;在名字空间\&lt;/g;s/&gt;?</\&gt;？</g' $MSG_TEMP
sed -i 's/> *Edit \+a *{{::/>修改{{::/g' $MSG_TEMP

# MSG_CONFIGMAPDETAIL
sed -i 's/> *Config \+Map *</>配置项字典(Config Map)</g' $MSG_TEMP
sed -i 's/> *Data *</>数据(Data)</g;s/> *Details *</>详情(Details)</g;s/> *Name *</>名称(Name)</g;s/> *Labels *</>标签(Labels)</g' $MSG_TEMP
# MSG_CONFIGMAPLIST
sed -i 's/> *Name *</>名称(Name)</g;s/> *Labels *</>标签(Labels)</g;s/> *Age *</>生存(Age)</g' $MSG_TEMP
# MSG_CONFIG_DIALOG
sed -i 's/> *Close *</>关闭</g;s/> *[lL]ast \+applied \+configuration *</>当前有效配置</g' $MSG_TEMP
# MSG_CONFIG_MAP_LIST
sed -i 's/> *Created \+at *</>创建于</g' $MSG_TEMP

# MSG_DAEMONSETDETAIL
sed -i 's/> *There are currently no Services with the same label selector as this Daemon Set.*</>没有找到与Daemon Set用同标签选择的服务（Service）。</' $MSG_TEMP
sed -i 's/> *There are currently no Pods scheduled on this Daemon Set.*</>没有找到使用该Daemon Set调度的Pod。</' $MSG_TEMP
sed -i 's/> *The memory usage includes the caches in the pods managed by this daemon set.*</>内存使用上包括Daemon Set下Pod的缓存。</' $MSG_TEMP

sed -i 's/}} *pending *</}}挂起(pending)</g;s/}} *failed *</}}失败(failed)</g;s/}} *running *</}}运行中(running)</g;s/}} *created *</}}已创建(created)</g;s/}} *desired *</}}已请求(desired)</g' $MSG_TEMP
sed -i 's/> *Images *</>镜像(Images)</g' $MSG_TEMP

# MSG_DAEMONSETLIST
sed -i 's/> *Kind *</>分类(Kind)</g;s/> *Daemon \+Set *</>守护式POD集(Daemon Set)</g' $MSG_TEMP
sed -i 's/> *One \+or \+more \+pods \+have \+errors\.\? *</>至少有一个Pod存在错误。</g;s/> *One \+or \+more \+pods \+are \+in \+pending \+state\.\? *</>至少有一个Pod是挂起状态。</g' $MSG_TEMP

# MSG_DEPLOYMENTDETAIL
sed -i 's/> *Deployment *</>部署(Deployment)</g' $MSG_TEMP
sed -i 's/> *There are currently no Horizontal Pod Autoscalers targeting this Replica Set.*</>没有找到与Replica Set相关的水平Pod自动伸缩控制。</g' $MSG_TEMP
sed -i 's/> *There are currently no new Replication Controllers on this Deployment.*</>没有找到与Deployment相关的新的Replication Controller。</g' $MSG_TEMP
sed -i 's/> *New \+Replica \+Sets\? *</>新的Replica Set</g;s/> *Old \+Replica \+Sets? *</>原先的Replica Set</g' $MSG_TEMP
sed -i 's/> *This Deployment does not have any old replica sets.*</>没有找到与Deployment相关的原先的Replica Set。</g' $MSG_TEMP
sed -i 's/> *The memory usage includes the caches in the pods managed by this deployment.*</>内存使用上包括Deployment下Pod的缓存。</g' $MSG_TEMP
sed -i 's/> *Max surge: *{{/>最大浪涌: {{/g;s/> *Max unavailable: *{{/>最大无效: {{/g' $MSG_TEMP
sed -i 's/}} *updated *</}}已更新(updated)</g;s/}} *total *</}}全部(total)</g;s/}} *available *</}}有效( available)</g;s/}} *unavailable *</}}无效(unavailable)</g' $MSG_TEMP
sed -i 's/> *Rolling \+update \+strategy *</>滚动升级策略</g' $MSG_TEMP

# MSG_DEPLOYMENTLIST
sed -i 's/> *The memory usage includes the caches in the pods managed by these deployments.*</>内存使用上包括Deployment下Pod的缓存。</' $MSG_TEMP

# MSG_DEPLOY
sed -i 's/> *Would you like to deploy anyway? *</>你现在要部署吗？</' $MSG_TEMP
sed -i 's/> *Validation \+error \+occurred *</>验证有错</;s/> *Create \+a \+new \+namespace *</>新建名字空间</' $MSG_TEMP
sed -i 's/> *The new namespace will be added to the cluster.*</>新的名字空间将加入集群。</;s/> *Namespace \+name *</>名字空间称谓</' $MSG_TEMP
sed -i 's/> *Name must be alphanumeric and may contain dashes.*</>称谓只能是字母数字和连接符</;s/> *Name must be up to {{::/>称谓至少需要{{::/;s/}} characters long\.\?</}}个字符。</' $MSG_TEMP
sed -i 's/> *Name is required.*</>称谓不可忽略</;s/> *A namespace with the specified name will be added to the cluster.*</>新的名字空间将加入集群。</' $MSG_TEMP
sed -i 's/> *Create a new image pull secret.*</>创建拉取镜像的保密项字典</;s/> *The new secret will be added to the cluster.*</>新的保密项字典将加入集群</' $MSG_TEMP
sed -i 's/> *Data must be Base64 encoded.*</>保密项字典数据必须使用Base64编码。</;s/> *Specify the data for your secret to hold. The value is the Base64 encoded content of a .dockercfg file.*</>保密项字典的数据是.dockercfg文件的Base64编码内容。</' $MSG_TEMP
sed -i 's/> *Name must follow the DNS domain name syntax (e.g. new.image-pull.secret).*</>名称必须符合DNS的命名方法。</;s/> *A secret with the specified name will be added to the cluster in the namespace.*</>保密项字典将加入集群的名字空间里。</' $MSG_TEMP

# MSG_ERROR
sed -i 's/>Source</>来源</g;s/>Sub-object</>子对象</g' $MSG_TEMP

# MSG_EVENTS

# MSG_GRAPH

# MSG_HORIZONTALPODAUTOSCALERDETAIL

# MSG_HORIZONTAL_POD_AUTOSCALER

# MSG_IMAGE

# MSG_INGRESSDETAIL

# MSG_INGRESSLIST

# MSG_JOBDETAIL

# MSG_JOBLIST

# MSG_LOGS
sed -i 's/> *Logs \+from *</>日志来自</g;s/> *in *</>在</g;s/> *to *</>到</g;s/> *The selected container has not logged any messages yet.*</>所选容器没有日志信息</' $MSG_TEMP

# MSG_NAMESPACEDETAIL

# MSG_NAMESPACE

# MSG_NODEDETAIL

# MSG_NODELIST

# MSG_NO_ERROR_DATA
sed -i 's/> *No error data available.*</>无错误</g' $MSG_TEMP

# MSG_PERSISTENTVOLUMECLAIMDETAIL

# MSG_PODDETAIL

# MSG_PODLIST

# MSG_REPLICASETDETAIL

# MSG_REPLICASETLIST

# MSG_REPLICATIONCONTROLLERDETAIL

# MSG_RESOURCELIMIT

# MSG_SECRETDETAIL
sed -i 's/> *Name *</>名称(Name)</g;s/> *Labels *</>标签(Labels)</g;s/> *Ready *</>就绪(Ready)</g;s/> *Age *</>生存(Age)</g' $MSG_TEMP

sed -i 's/> *Name *</>Name（名称）</g;s/> *Labels *</>Labels（标签）</g;s/> *Pods *</>Pods（容器组）</g;s/> *Age *</>生存(Age)</g' $MSG_TEMP

sed -i 's/> *Name *</>Name（名称）</g;s/> *Status *</>Status（状态）</g;s/> *Restarts *</>Restarts（重启次数）</g;s/> *Cluster \+IP *</>Cluster IP（集群虚IP）</g;s/> *CPU(cores) *</>CPU(cores)（CPU核数）</g;s/> *Memory(bytes) *</>Memory(bytes)（内存字节数）</g' $MSG_TEMP

sed -i 's/> *Name *</>Name（名称）</g;s/> *Labels *</>Labels（标签）</g;s/> *Cluster \+IP *</>Cluster IP（集群虚IP）</g;s/> *Internal \+endpoints *</>Internal endpoints（容器地址及端口）</g;s/> *External \+endpoints *</>External endpoints（对外地址及端口）</g' $MSG_TEMP

sed -i 's/> *Logs *</>Logs（日志）</g;s/> *Log *</>Log（日志）</g;s/> *Deploy *</>部署</g;s/> *Learn \+more *</>了解更多</g' $MSG_TEMP
sed -i 's/> *Stateful \+Set *</>Stateful Set（有状态POD集）</g' $MSG_TEMP

sed -i 's/> *Created \+by *: *</>Created by:（创建者）</g; s/> *CREATE *</>CREATE（新建）</g; s/> *EDIT *</>EDIT（编辑）</g; s/> *DELETE *</>DELETE（删除）</g; s/> *Cancel *</>取消</g; s/> *Update *</>更新</g;s/> *Create \+an \+app *</>创建应用</g; s/> *Horizontal \+Pod \+Autoscalers *</>Pod水平自动伸缩</g' $MSG_TEMP


sed -i 's/> *Secret \+name *</>保密项字典名称</g;s/> *Rows \+per \+page *</>Rows per page（每页行数）</g;s/> *Of *</>Of（共）</g' $MSG_TEMP

sed -i 's/> *CPU \+[Uu]sage *</>CPU使用</g;s/> *CPU \+limit *</>CPU限制</g;s/> *Memory \+[Uu]sage *</>内存使用</g; s/> *Memory \+limit *</>内存限制</g' $MSG_TEMP

sed -i 's/> *Pods \+status *</>Pods状态</g;s/> *App \+name *</>应用名称</g' $MSG_TEMP

sed -i 's/}} *pending *</}} pending（挂起）</g;s/}} *failed *</}} failed（失败）</g;s/}} *running *</}} running（运行中）</g;s/}} *created *</}} created（已创建）</g' $MSG_TEMP


sed -i 's/> *Strategy *</>策略</g;s/> *Label \+selector *</>所选的标签</g' $MSG_TEMP

sed -i 's/> *Min \+ready \+seconds *</>最小就绪秒数</g;s/> *Revision \+history \+limit *</>版本修订限制</g;s/> *Not \+set *</>没有设置</g' $MSG_TEMP

sed -i 's/> *No *</>否</g;s/> *Yes *</>是</g' $MSG_TEMP

sed -i 's/> *Image \+pull \+secret \+data *</>镜像获取保密项字典数据</g;s/> *Data is required. *</>数据不能忽略</g;s/> *Deploy a Containerized App *</>部署一个容器应用</g' $MSG_TEMP

sed -i 's/> *All *</>全部</g;s/> *Count *</>数量</g;s/> *Events *</>事件</g' $MSG_TEMP

sed -i 's/> *There are currently no Pods selected by this Service\.? *</>还没有可供服务（Service）选中的Pod（基于标签）</g' $MSG_TEMP

# MSG_TIME_UNIT
sed -i 's/> *years *</>年</g;s/> *a \+year *</>1年</g;s/> *months *</>月</g;s/> *a \+month *</>1月</g;s/> *days *</>天</g;s/> *a \+day *</>1天</g;s/> *hours *</>小时</g;s/> *an \+hour *</>1小时</g;s/> *minutes *</>分钟</g;s/> *a \+minute *</>1分钟</g;s/> *seconds *</>秒</g;s/> *a \+second *</>1秒</g' $MSG_TEMP

# MSG_UNKNOWN_SERVER_ERROR
sed -i 's/> *Unknown \+Server \+Error\.\? *</>未知的服务错误(Unknown Server Error)</g' $MSG_TEMP

# MSG_WORKLOADS
sed -i 's/> *CPU \+[Uu]sage *</>CPU使用</g;s/> *Memory \+[Uu]sage *</>内存使用</g' $MSG_TEMP
sed -i 's/The memory usage includes the caches in the pods managed by these resources. (Does not count pods double because it is mentioned both in the pod list and its controller is mentioned in e.g. a replica set.)/内存使用上包括相关Pod的缓存（不要重复计算Pod使用，在PodList及控制如ReplicaSet上）/' $MSG_TEMP

